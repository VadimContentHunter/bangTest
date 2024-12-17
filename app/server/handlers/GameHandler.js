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
 * @event GameHandler#playerStartedMove
 * @type {Object}
 * @description Событие испускается, когда игрок начинает выполнять ход.
 * @param {Object} player - Игрок, который начинает ход.
 */

/**
 * @event GameHandler#playerMoveFinished
 * @type {Object}
 * @description Событие испускается, когда игрок завершает свой ход.
 * @param {Object} player - Игрок, который завершил ход.
 */

/**
 * @event GameHandler#lockPlayersMoves
 * @type {Object}
 * @description Событие испускается, чтобы заблокировать ход всем игрокам.
 * @property {PlayerCollection} players - Коллекция игроков, ходы которых будут заблокированы.
 */

/**
 * Класс GameHandler управляет игровой логикой и испускает события для уведомления об изменениях.
 * @extends EventEmitter
 * @fires GameHandler#beforeGameStart - Событие, испускаемое перед началом игры.
 * @fires GameHandler#afterGameStart - Событие, испускаемое сразу после старта игры.
 * @fires GameHandler#afterSelectCharacterForPlayer - Событие, испускаемое после завершения выбора персонажа для всех игроков.
 * @fires GameHandler#selectionStarted - Событие, испускаемое при начале выбора карты.
 * @listens GameHandler#playerCardSelected - Слушает событие выбора карты игроком и обрабатывает его.
 * @fires GameHandler#playerStartedMove - Событие, испускаемое при начале выбора карты.
 * @listens GameHandler#playerMoveFinished - Слушает событие когда игрок завершает свой ход.
 * @fires GameHandler#lockPlayersMoves - Событие испускается, чтобы заблокировать ход всем игрокам.
 */
class GameHandler extends EventEmitter {
    constructor(playroomHandler) {
        super();
        if (!(playroomHandler instanceof PlayroomHandler)) {
            throw new Error("GameHandler: playroomHandler must be an instance of PlayroomHandler");
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
     * Ожидает выбора персонажей от игроков.
     * @fires GameHandler#selectionStarted
     * @listens GameHandler#playerCardSelected
     */
    async selectCharactersForPlayers() {
        const player = this.playroomHandler.playerOnline.getPlayerWithMinIdWithoutCharacter();

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
                console.log(`GameHandler: Игрок ${player.name} выбрал карту: ${selectedCard.name}`);
                player.character = selectedCard;

                this.selectCharactersForPlayers(); // Рекурсивный вызов для следующего игрока
            } catch (error) {
                console.error(
                    `GameHandler: Ошибка выбора карты для игрока ${player.name}:`,
                    error.message
                );
            }
        } else {
            console.log("GameHandler: Все игроки выбрали персонажей.");
            this.emit("afterSelectCharactersForPlayers");
        }
    }

    /**
     * Ожидает выбор карты игроком с таймером.
     * @param {Object} player - Игрок, который должен выбрать карту.
     * @param {Object} selectionCards - Объект с картами для выбора.
     * @param {number} timer - Таймаут ожидания в миллисекундах (по умолчанию 30000).
     * @returns {Promise<Object>} Возвращает выбранную карту.
     * @throws {SelectionCardsError} В случае ошибки выбора или истечения времени.
     * @listens GameHandler#playerCardSelected
     */
    async waitForPlayerCardSelection(player, selectionCards, timer = 30000) {
        console.log(`GameHandler: Ожидание выбора карты от игрока: ${player.name}`);

        return new Promise((resolve, reject) => {
            // const timeout = setTimeout(() => {
            //     reject(new SelectionCardsError("Время на выбор карты истекло."));
            // }, timer);

            this.once("playerCardSelected", (ws, card, id = null) => {
                // clearTimeout(timeout); // Очищаем таймаут

                // Здесь можно добавить проверку выбранной карты
                // if (params && selectionCards.collectionCards.some((c) => c.id === params.id)) {
                //     resolve(params);
                // } else {
                //     reject(new SelectionCardsError("Выбрана неверная карта."));
                // }
                // Здесь можно добавить проверку выбранной карты
                resolve(new StubCard(CardType.CHARACTER));
            });
        });
    }

    /**
     * Выполняет раунд ходов игроков.
     * @fires GameHandler#playerStartedMove - Событие, испускаемое, когда игрок начинает ход.
     * @fires GameHandler#lockPlayersMoves - Событие испускается, чтобы заблокировать ход всем игрокам.
     * @listens GameHandler#playerMoveFinished - Слушает событие, когда игрок завершает свой ход.
     */
    async executeMovesRound() {
        const playersRound = this.playroomHandler.playerOnline.getPlayersSortedAsc();
        for (const player of playersRound) {
            this.emit("playerStartedMove", { player });
            console.log(`GameHandler: Игрок ${player.name} начинает ход.`);
            try {
                // Ожидаем завершения хода игрока с таймером
                await this.waitForPlayerMove(player, 30000); // Таймаут на 30 секунд
                console.log(`GameHandler: Игрок ${player.name} завершил ход.`);
            } catch (error) {
                console.error(
                    `GameHandler: Ошибка выполнения хода игроком ${player.name}: ${error.message}`
                );
            }
        }
        this.emit("afterMovesRound");
    }

    /**
     * Ожидает завершения хода игроком с таймером.
     * @param {Object} player - Игрок, который должен завершить ход.
     * @param {number} timer - Таймаут ожидания в миллисекундах (по умолчанию 30000).
     * @returns {Promise} Возвращает промис, который выполняется, когда игрок завершает ход.
     * @throws {MoveError} В случае ошибки или истечения времени.
     * @listens GameHandler#playerMoveFinished
     */
    async waitForPlayerMove(player, timer = 30000) {
        console.log(`GameHandler: Ожидание завершения хода от игрока: ${player.name}`);

        return new Promise((resolve, reject) => {
            // const timeout = setTimeout(() => {
            //     reject(new MoveError(`Время на ход игрока ${player.name} истекло.`));
            // }, timer);

            const moveFinishedHandler = (ws, params, id = null) => {
                // Проверяем, что sessionId из события совпадает с ожидаемым
                if (ws.sessionId === player.sessionId) {
                    // Игрок завершил ход, раз разрешение на событие только для этого игрока
                    // clearTimeout(timeout); // Очищаем таймер, если используем его
                    console.log("Игрок походил --Карта--");
                    resolve();
                    // После того как нужный игрок завершил ход, убираем обработчик
                    this.removeListener("playerMoveFinished", moveFinishedHandler);
                } else {
                    console.log(
                        `Игрок с sessionId ${ws.sessionId} не может завершить ход для ${player.name}`
                    );
                }
            };

            // Подписываемся на событие
            this.on("playerMoveFinished", moveFinishedHandler);

            // В случае истечения времени или ошибки, обработчик должен быть удалён
            // setTimeout(() => {
            //     reject(new MoveError(`Время на ход игрока ${player.name} истекло.`));
            //     this.removeListener("playerMoveFinished", moveFinishedHandler); // Убираем обработчик при истечении таймаута
            // }, timer);

            // Важно помнить, что после вызова resolve() или reject() обработчик все равно будет оставаться.
            // Убедитесь, что он удаляется в любом случае.
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
