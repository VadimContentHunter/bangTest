const Player = require("./Player"); // Подключение модели Player
const GameTableError = require("../Errors/GameTableError"); // Подключение ошибки для дистанции
const { aCard } = require("../interfaces/aCard");
const CardsCollection = require("../handlers/CardsCollection");

class GameTable {
    /** @type {number} */
    #countDeckMain = 0;

    /** @type {number} */
    #countDiscardPile = 0;

    /** @type {number | null} */
    #timer = null;

    /** @type {CardsCollection|null} */
    #playedCards = null;

    /**
     * Конструктор класса GameTable.
     */
    constructor(playedCards = null) {
        this.#countDeckMain = 0;
        this.#countDiscardPile = 0;
        this.#playedCards = playedCards ?? new CardsCollection();
    }

    // ======== SET методы ========

    /**
     * Устанавливает количество карт в главной колоде (deckMain).
     * @param {number} value - Количество карт.
     * @throws {GameTableError} Если значение не является положительным целым числом.
     */
    set countDeckMain(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new GameTableError("countDeckMain должен быть неотрицательным целым числом.");
        }
        this.#countDeckMain = value;
    }

    /**
     * Устанавливает количество карт в колоде сброса (discardPile).
     * @param {number} value - Количество карт.
     * @throws {GameTableError} Если значение не является положительным целым числом.
     */
    set countDiscardPile(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new GameTableError("countDiscardPile должен быть неотрицательным целым числом.");
        }
        this.#countDiscardPile = value;
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

    set playedCards(value) {
        if (!(value instanceof CardsCollection) && value !== null) {
            throw new GameTableError(
                "playedCards должен быть экземпляром CardsCollection или null."
            );
        }
        this.#playedCards = value;
    }

    // ======== GET методы ========

    /**
     * Возвращает количество карт в главной колоде (deckMain).
     * @returns {number} Количество карт.
     */
    get countDeckMain() {
        return this.#countDeckMain;
    }

    /**
     * Возвращает количество карт в колоде сброса (discardPile).
     * @returns {number} Количество карт.
     */
    get countDiscardPile() {
        return this.#countDiscardPile;
    }

    /**
     * Возвращает значение таймера.
     * @returns {number | null} Таймер или null, если не установлен.
     */
    get timer() {
        return this.#timer;
    }

    /**
     * Возвращает карты, сыгранные на стол (playedCards).
     * @returns {CardsCollection|null} Массив карт.
     */
    get playedCards() {
        return this.#playedCards;
    }

    /**
     * Добавляет карты игрока на стол.
     * @param {Player} player - Экземпляр игрока.
     * @param {Array<aCard>} cards - Массив карт.
     * @throws {GameTableError} Если переданы некорректные параметры.
     */
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
            this.addPlayerOneCard(player, card);
        }
    }

    /**
     * Добавляет карту игрока на стол.
     * @param {Player} player - Экземпляр игрока.
     * @param {Array<aCard>} cards - Массив карт.
     * @throws {GameTableError} Если переданы некорректные параметры.
     */
    addPlayerOneCard(player, card) {
        if (!(player instanceof Player)) {
            throw new GameTableError("Игрок не наследуется от класса Player.");
        }

        if (!(card instanceof aCard)) {
            throw new GameTableError("Все элементы массива cards должны быть экземплярами aCard.");
        }
        card.ownerName = player.name;
        this.playedCards.addCard(card, false);
    }

    /**
     * Возвращает JSON-представление игрового стола.
     * @returns {Object} JSON-объект с информацией о состоянии игрового стола.
     */
    toJSON() {
        return {
            countDeckMain: this.countDeckMain,
            countDiscardPile: this.countDiscardPile,
            timer: this.timer,
            collectionCards: this.playedCards,
        };
    }

    static initFromJSON(inputData) {
        const procData = typeof inputData === "string" ? JSON.parse(inputData) : inputData;
        return new GameTable(CardsCollection.initFromJSON(procData.collectionCards, false));
    }
}

module.exports = GameTable;
