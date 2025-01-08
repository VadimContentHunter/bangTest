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
    #gameTable = null;
    #player = null;

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
        });
    }

    /**
     * Геттер для #gameTable.
     * @returns {GameTable|null} Текущая игровая таблица, на которой находится карта.
     */
    get gameTable() {
        return this.#gameTable;
    }

    /**
     * Сеттер для #gameTable.
     * @param {GameTable|null} value - Новое значение для игровой таблицы.
     * @throws {CardError} Если значение не является экземпляром GameTable.
     */
    set gameTable(value) {
        if (value === null || value instanceof GameTable) {
            this.#gameTable = value;
        } else {
            throw new CardError(
                "BlackJack: Invalid gameTable provided. Must be an instance of GameTable or null."
            );
        }
    }

    /**
     * Геттер для #player.
     * @returns {Player|null}
     */
    get player() {
        return this.#player;
    }

    /**
     * Сеттер для #player.
     * @param {CardsCollection|null} value - Новое значение для руки карт.
     * @throws {CardError} Если значение не является экземпляром CardsCollection.
     */
    set player(value) {
        if (value === null || value instanceof Player) {
            this.#player = value;
        } else {
            throw new CardError(
                "BlackJack: Invalid player provided. Must be an instance of Player or null."
            );
        }
    }

    /**
     * Инициализирует объект BlackJack из JSON-данных.
     * @param {Object} data - Данные карты в формате JSON.
     * @param {string} data.ownerName - Имя владельца карты.
     * @returns {BlackJack} Новый объект BlackJack.
     */
    static initFromJSON(data) {
        return new BlackJack(data?.ownerName ?? "");
    }

    /**
     * Метод действия карты BlackJack.
     * @listens GameTable#cardDrawn Обрабатывает событие "cardDrawn", которое вызывается, когда карты были взяты из основной колоды.
     * @throws {CardError} Если переданы некорректные значения для параметров.
     */
    action() {
        if (this.gameTable instanceof GameTable) {
            /**
             * Обрабатывает событие "cardDrawn", которое вызывается, когда карты были взяты из основной колоды.
             *
             * @listens GameTable#cardDrawn
             * @param {Object} param0 - Объект, содержащий данные о взятых картах.
             * @param {Array<aCard>} param0.drawnCards - Массив карт, которые были взяты из основной колоды.
             * @param {number} param0.remainingInDeck - Количество оставшихся карт в основной колоде.
             * @param {Player|null} param0.drawingPlayer  - Игрок, который взял карты, или null, если игрок не указан.
             * @throws {CardError} Если переданы некорректные данные для параметров.
             */
            this.gameTable.events.on(
                "cardDrawn",
                ({ drawnCards, remainingInDeck, drawingPlayer = null }) => {
                    // Проверка, что drawnCards — это массив объектов типа aCard
                    if (!Array.isArray(drawnCards)) {
                        throw new CardError("BlackJack: drawnCards должно быть массивом.");
                    }

                    if (
                        drawingPlayer instanceof Player &&
                        this.player instanceof Player &&
                        drawingPlayer.name !== this.player.name
                    ) {
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
                                    this.player?.name || "неизвестный"
                                } берет еще одну карту`
                            );

                            const selectionCards = new SelectionCards({
                                title: `Событие персонажа ${this.name}`,
                                description:
                                    "Если карта масти 'Черва' или 'Бубна', игрок берет карту",
                                textExtension: `Игрок <i>${
                                    this.player?.name || "неизвестный"
                                }</i> вытянул эту карту . . .`,
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
                            this.gameTable.events.emit("showCards", { selectionCards });
                        }
                    });

                    this.gameTable.drawCardsForPlayer(this.player, drawCount, true);
                }
            );
        } else {
            throw new CardError("BlackJack: Некорректный объект GameTable.");
        }
    }
}

module.exports = BlackJack;
