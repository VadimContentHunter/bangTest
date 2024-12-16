const GameHandlerError = require("../Errors/GameHandlerError");
const EventEmitter = require("events");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");
const GameSessionHandler = require("./GameSessionHandler");
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const GameTableError = require("../Errors/GameTableError");
const GameTable = require("../models/GameTable");
const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const HistoryHandler = require("../handlers/HistoryHandler");
const MoveError = require("../Errors/MoveError");
const Move = require("../models/Move");
const CardsCollection = require("../handlers/CardsCollection");
const SelectionCardsError = require("../Errors/SelectionCardsError");
const SelectionCards = require("../models/SelectionCards");
const { aCard, CardType } = require("../interfaces/aCard");
const StubCard = require("../models/cards/StubCard");

/**
 * @event GameHandler#beforeGameStart
 * @type {Object}
 * @description Событие испускается непосредственно перед запуском игры.
 */

/**
 * @event GameHandler#afterGameStart
 * @type {Object}
 * @description Событие испускается сразу после успешного старта игры.
 */

/**
 * @event GameHandler#selectionStarted
 * @type {Object}
 * @description Событие испускается, когда начинается процесс выбора карты.
 * @param {Object} player - Игрок, который должен выбрать карту.
 * @param {Object} selectionCards - Набор карт для выбора.
 */

/**
 * @event GameHandler#playerCardSelected
 * @type {Object}
 * @description Событие испускается, когда игрок выбирает карту.
 * @param {Object} ws - Объект WebSocket для работы с соединением.
 * @param {Object} params - Параметры, содержащие информацию о выбранной карте.
 * @param {string} [id=null] - Дополнительный идентификатор для выбора карты.
 */

/**
 * Класс GameHandler управляет игровой логикой и испускает события для уведомления об изменениях.
 * @extends EventEmitter
 * @fires GameHandler#beforeGameStart - Событие, испускаемое перед началом игры.
 * @fires GameHandler#afterGameStart - Событие, испускаемое сразу после старта игры.
 * @fires GameHandler#afterSelectCharacterForPlayer - Событие, испускаемое после завершения выбора персонажа для всех игроков.
 * @fires GameHandler#selectionStarted - Событие, испускаемое при начале выбора карты.
 * @listens GameHandler#playerCardSelected - Слушает событие выбора карты игроком и обрабатывает его.
 */
class GameHandler extends EventEmitter {
    constructor(playroomHandler) {
        super();
        if (!(playroomHandler instanceof PlayroomHandler)) {
            throw new Error("playroomHandler must be an instance of PlayroomHandler");
        }
        this.playroomHandler = playroomHandler;
        this.gameSessionHandler = new GameSessionHandler();
        this.gameTable = new GameTable();
        this.mainDeck = new CardsCollection();
        this.discardDeck = new CardsCollection();
        this.distanceHandler = new DistanceHandler();
        this.historyHandler = new HistoryHandler();
    }

    getDistanceHandler() {
        return this.gameSessionHandler?.head?.playersDistances;
    }

    /**
     * Запускает игру.
     * @fires GameHandler#beforeGameStart
     * @fires GameHandler#afterGameStart
     */
    startGame() {
        this.emit("beforeGameStart");

        this.gameSessionHandler.createGameSession();
        this.distanceHandler.setDistancesForPlayers(this.playroomHandler.playerOnline.getPlayers());
        this.saveForGameSession();

        this.emit("afterGameStart");
    }

    /**
     * Ожидает выбора персонажа от игроков.
     * @fires GameHandler#selectionStarted
     * @listens GameHandler#playerCardSelected
     */
    async selectCharacterForPlayer() {
        const player = this.playroomHandler.playerOnline.getFirstPlayerWithoutRole([
            new StubCard(CardType.ROLE),
        ]);

        if (player instanceof Player) {
            try {
                const selectionCards = new SelectionCards({
                    title: "Выбор карты для роли",
                    description: "Выберите карту для роли:",
                    textExtension: `Игрок <i>${player.name}</i> выбирает роль . . .`,
                    collectionCards: [
                        new StubCard(CardType.DEFAULT),
                        new StubCard(CardType.WEAPON),
                        new StubCard(CardType.CHARACTER),
                    ],
                });

                // Генерируем событие для сервера
                this.emit("selectionStarted", { player, selectionCards });

                // Ожидаем выбора карты игроком
                const selectedCard = await this.waitForPlayerCardSelection(player, selectionCards);

                console.log(`Игрок ${player.name} выбрал карту: ${selectedCard.type}`);
                this.selectCharacterForPlayer(); // Рекурсивный вызов для следующего игрока
            } catch (error) {
                console.error(`Ошибка выбора карты для игрока ${player.name}:`, error.message);
            }
        } else {
            console.log("Все игроки выбрали персонажей.");
            this.emit("afterSelectCharacterForPlayer");
        }
    }

    /**
     * Ожидает выбор карты игроком с таймером.
     * @param {Object} player - Игрок, который должен выбрать карту.
     * @param {Object} selectionCards - Объект с картами для выбора.
     * @param {number} timer - Таймаут ожидания в миллисекундах (по умолчанию 30000).
     * @returns {Promise<Object>} Возвращает выбранную карту.
     * @throws {SelectionCardsError} В случае ошибки выбора или истечения времени.
     * @fires GameHandler#selectionStarted
     * @listens GameHandler#playerCardSelected
     */
    async waitForPlayerCardSelection(player, selectionCards, timer = 30000) {
        console.log(`Ожидание выбора карты от игрока: ${player.name}`);

        return new Promise((resolve, reject) => {
            // const timeout = setTimeout(() => {
            //     reject(new SelectionCardsError("Время на выбор карты истекло."));
            // }, timer);

            this.once("playerCardSelected", (ws, params, id = null) => {
                // clearTimeout(timeout); // Очищаем таймаут

                // Здесь можно добавить проверку выбранной карты
                // if (params && selectionCards.collectionCards.some((c) => c.id === params.id)) {
                //     resolve(params);
                // } else {
                //     reject(new SelectionCardsError("Выбрана неверная карта."));
                // }
                // Здесь можно добавить проверку выбранной карты
                resolve({ type: "selection stub object" });
            });
        });
    }

    saveForGameSession() {
        this.gameSessionHandler.loadData();
        this.gameSessionHandler.setData({
            playersDistances: this.distanceHandler,
            players: [],
            history: {},
        });

        this.gameSessionHandler.saveData();
    }
}

module.exports = GameHandler;
