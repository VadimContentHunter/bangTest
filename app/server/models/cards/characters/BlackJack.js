const { aCard, CardType, CardSuit } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const GameTable = require("../../../models/GameTable");
const Player = require("../../../models/Player");
const SelectionCards = require("../../../models/SelectionCards");

/**
 * Класс BlackJack представляет карту типа Character в игре.
 * @extends aCard
 */
class BlackJack extends aCard {
    /**
     * @type {Player|null}
     * @private
     */
    #cardPlayer = null;

    /**
     * @type {GameTable|null}
     * @private
     */
    #cardGameTable = null;

    /**
     * Сохраняем привязанный обработчик
     */
    boundHandler = null;

    /**
     * Создаёт новый объект BlackJack.
     * @param {string} ownerName - Имя владельца карты.
     */
    constructor(ownerName = "") {
        super({
            name: "Black Jack",
            image: "../resources/imgs/cards/characters/01_blackjack.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
            targetName: "",
        });
    }

    /**
     * Инициализирует объект BlackJack из JSON-данных.
     * @param {Object} data - Данные карты в формате JSON.
     * @param {PLayer|null} [data.player=null] - Количество жизней.
     * @param {GameTable|null} [data.gameTable=null] - Игровая таблица.
     * @param {string} data.ownerName - Имя владельца карты.
     * @returns {BlackJack} Новый объект BlackJack.
     */
    static initFromJSON(data) {
        return new BlackJack(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    /**
     * @param {Object} param0 - Объект, содержащий данные о взятых картах.
     * @param {Array<aCard>} param0.drawnCards - Массив карт, которые были взяты из основной колоды.
     * @param {Player|null} param0.drawingPlayer  - Игрок, который взял карты, или null, если игрок не указан.
     * @throws {CardError} Если переданы некорректные данные для параметров.
     */
    handler({ drawnCards, drawingPlayer = null }) {
        if (!(this.#cardPlayer instanceof Player)) {
            throw new TypeError("this.#cardPlayer должен быть экземпляром Player");
        }

        if (!(this.#cardGameTable instanceof GameTable)) {
            throw new TypeError("this.#cardGameTable должен быть экземпляром GameTable");
        }

        // Проверка, что drawnCards — это массив объектов типа aCard
        if (!Array.isArray(drawnCards)) {
            throw new CardError("BlackJack: drawnCards должно быть массивом.");
        }

        if (drawingPlayer instanceof Player && drawingPlayer.name !== this.#cardPlayer.name) {
            return;
        }

        let drawCount = 0;
        drawnCards.forEach((card, index) => {
            if (!(card instanceof aCard)) {
                throw new CardError(
                    "BlackJack: каждый элемент в drawnCards должен быть экземпляром aCard."
                );
            }

            if (
                index % 2 === 1 &&
                (card.suit === CardSuit.HEARTS || card.suit === CardSuit.DIAMONDS)
            ) {
                drawCount++;

                console.log(
                    `BlackJack: игрок ${
                        this.#cardPlayer?.name || "неизвестный"
                    } берет еще одну карту`
                );

                const selectionCards = new SelectionCards({
                    title: `Событие персонажа ${this.name}`,
                    description: "Если карта масти 'Черва' или 'Бубна', игрок берет карту",
                    textExtension: `Игрок <i>${
                        this.#cardPlayer?.name || "неизвестный"
                    }</i> вытянул карту: 
                            (<b><i>${card.name}</i></b>, <b><i>${card.suit}</i></b>, <b><i>${
                        card.rank
                    }</i></b>)`,
                    collectionCards: [card],
                    selectionCount: 0,
                    isWaitingForResponse: false,
                });

                /**
                 * Событие, которое вызывает отображение карт.
                 * @event GameTable#showCards
                 * @type {Object}
                 * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
                 * @property {SelectionCards} selectionCards - Объект выбора карт.
                 */
                this.#cardPlayer.events.emit("showCards", { selectionCards });
            }
        });

        this.#cardPlayer.drawFromDeck(this.#cardGameTable, drawCount, true);
        // this.gameTable.drawCardsForPlayer(player, drawCount, true);
    }

    removeEventListener() {
        if (this.#cardPlayer?.events && this.boundHandler !== null) {
            this.#cardPlayer.events.off("beforeDrawCards", this.boundHandler);
            this.boundHandler = null; // Убираем ссылку для предотвращения повторного использования
        }
    }

    /**
     * Метод действия карты BlackJack.
     * @listens GameTable#cardDrawn Обрабатывает событие "cardDrawn", которое вызывается, когда карты были взяты из основной колоды.
     * @throws {CardError} Если переданы некорректные значения для параметров.
     */
    action({ player, gameTable }) {
        if (gameTable instanceof GameTable && player instanceof Player) {
            this.#cardPlayer = player;
            this.#cardGameTable = gameTable;

            // Сохраняем обработчик
            this.boundHandler = this.handler.bind(this);

            /**
             * Обрабатывает событие "cardDrawn", которое вызывается, когда карты были взяты из основной колоды.
             *
             * @listens GameTable#cardDrawn
             * @param {Object} param0 - Объект, содержащий данные о взятых картах.
             * @param {Array<aCard>} param0.drawnCards - Массив карт, которые были взяты из основной колоды.
             * @param {Player|null} param0.drawingPlayer  - Игрок, который взял карты, или null, если игрок не указан.
             * @throws {CardError} Если переданы некорректные данные для параметров.
             */
            player.events.on("cardDrawn", this.boundHandler);
        } else {
            throw new CardError("BlackJack: Некорректный объект GameTable.");
        }
    }

    destroy() {
        this.removeEventListener();
        this.#cardPlayer = null;
        this.#cardGameTable = null;
    }
}

module.exports = BlackJack;
