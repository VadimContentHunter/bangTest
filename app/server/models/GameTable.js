const Player = require("./Player"); // Подключение модели Player
const GameTableError = require("../Errors/GameTableError"); // Подключение ошибки для дистанции
const CardsCollection = require("../handlers/CardsCollection");
const { aCard } = require("../interfaces/aCard");

class GameTable {
    /** @type {CardsCollection | null} */
    #deckMain = null;

    /** @type {CardsCollection | null} */
    #discardPile = null;

    /** @type {number | null} */
    #timer = null;

    /** @type {CardsCollection | null} */
    #playedCards = null;

    /**
     * Конструктор класса GameTable.
     */
    constructor() {
        this.deckMain = new CardsCollection();
        this.discardPile = new CardsCollection();
        this.playedCards = new CardsCollection();
    }

    // ======== SET методы ========

    /**
     * Устанавливает главную колоду (deckMain).
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set deckMain(value) {
        if (!(value instanceof CardsCollection)) {
            throw new GameTableError("deckMain должен быть экземпляром CardsCollection.");
        }
        this.#deckMain = value;
    }

    /**
     * Устанавливает колоду сброса (discardPile).
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set discardPile(value) {
        if (!(value instanceof CardsCollection)) {
            throw new GameTableError("discardPile должен быть экземпляром CardsCollection.");
        }
        this.#discardPile = value;
    }

    /**
     * Устанавливает таймер.
     * @param {number} value - Целое число, представляющее таймер.
     * @throws {GameTableError} Если значение не является целым числом.
     */
    set timer(value) {
        if (!Number.isInteger(value)) {
            throw new GameTableError("timer должен быть целым числом.");
        }
        this.#timer = value;
    }

    /**
     * Устанавливает карты, сыгранные на стол (playedCards).
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set playedCards(value) {
        if (!(value instanceof CardsCollection)) {
            throw new GameTableError("playedCards должен быть экземпляром CardsCollection.");
        }
        this.#playedCards = value;
    }

    // ======== GET методы ========

    /**
     * Возвращает главную колоду (deckMain).
     * @returns {CardsCollection} Экземпляр CardsCollection.
     * @throws {GameTableError} Если свойство не установлено.
     */
    get deckMain() {
        if (!this.#deckMain) {
            throw new GameTableError("deckMain не инициализирован.");
        }
        return this.#deckMain;
    }

    /**
     * Возвращает колоду сброса (discardPile).
     * @returns {CardsCollection} Экземпляр CardsCollection.
     * @throws {GameTableError} Если свойство не установлено.
     */
    get discardPile() {
        if (!this.#discardPile) {
            throw new GameTableError("discardPile не инициализирован.");
        }
        return this.#discardPile;
    }

    /**
     * Возвращает значение таймера.
     * @returns {number} Целое число.
     * @throws {GameTableError} Если таймер не установлен.
     */
    get timer() {
        // if (this.#timer === null) {
        //     throw new GameTableError("timer не инициализирован.");
        // }
        return this.#timer;
    }

    /**
     * Возвращает карты, сыгранные на стол (playedCards).
     * @returns {CardsCollection} Экземпляр CardsCollection.
     * @throws {GameTableError} Если свойство не установлено.
     */
    get playedCards() {
        if (!this.#playedCards) {
            throw new GameTableError("playedCards не инициализирован.");
        }
        return this.#playedCards;
    }

    addPlayerCards(player, cards) {
        if (!(player instanceof Player)) {
            throw new GameTableError("Игрок не наследуется от класса Player.");
        }

        if (!Array.isArray(cards)) {
            throw new GameTableError("cards должен быть массивом.");
        }

        for (const card of cards) {
            if (!(card instanceof aCard)) {
                throw new GameTableError(
                    "Все элементы массива cards должны быть экземплярами aCard."
                );
            }
        }

        // Присваиваем имя владельца каждой карте и добавляем её в playedCards
        for (const card of cards) {
            card.ownerName = player.name;
            this.playedCards.addCard(card);
        }
    }

    toJSON() {
        return {
            countDeckMain: this.deckMain.countCards(),
            countDiscardPile: this.discardPile.countCards(),
            timer: this.timer,
            collectionCards: this.playedCards.getAllCards(),
        };
    }
}

module.exports = GameTable;
