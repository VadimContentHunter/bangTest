const Player = require("../models/Player"); // Подключение модели Player
const SelectionCardsError = require("../Errors/SelectionCardsError"); // Подключение ошибки
const CardsCollection = require("../handlers/CardsCollection");
const { aCard } = require("../interfaces/aCard");

class SelectionCardsHandler {
    /** @type {string} */
    #title = "";

    /** @type {string} */
    #description = "";

    /** @type {string} */
    #textExtension = "";

    /** @type {number | null} */
    #timer = null;

    /** @type {CardsCollection | null} */
    #collectionCards = null;

    /**
     * Конструктор класса SelectionCardsHandler.
     */
    constructor({
        title = "",
        description = "",
        textExtension = "",
        collectionCards = [],
        timer = null,
    }) {
        this.title = title;
        this.description = description;
        this.textExtension = textExtension;
        this.timer = timer;
        this.collectionCards = new CardsCollection();
        this.collectionCards.setCards(collectionCards);
    }

    // ======== SET методы ========

    /**
     * Устанавливает заголовок (title).
     * @param {string} value - Строка заголовка.
     * @throws {SelectionCardsError} Если значение не строка.
     */
    set title(value) {
        if (typeof value !== "string") {
            throw new SelectionCardsError("Заголовок (title) должен быть строкой.");
        }
        this.#title = value;
    }

    /**
     * Устанавливает описание (description).
     * @param {string} value - Строка описания.
     * @throws {SelectionCardsError} Если значение не строка.
     */
    set description(value) {
        if (typeof value !== "string") {
            throw new SelectionCardsError("Описание (description) должно быть строкой.");
        }
        this.#description = value;
    }

    /**
     * Устанавливает текст расширения (textExtension).
     * @param {string} value - Строка текста расширения.
     * @throws {SelectionCardsError} Если значение не строка.
     */
    set textExtension(value) {
        if (typeof value !== "string") {
            throw new SelectionCardsError("Текст расширения (textExtension) должен быть строкой.");
        }
        this.#textExtension = value;
    }

    /**
     * Устанавливает таймер.
     * @param {number} value - Целое число, представляющее таймер.
     * @throws {SelectionCardsError} Если значение не целое число.
     */
    set timer(value) {
        if (!Number.isInteger(value) && value !== null) {
            throw new SelectionCardsError("Таймер (timer) должен быть целым числом или null.");
        }
        this.#timer = value;
    }

    /**
     * Устанавливает коллекцию карт.
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {SelectionCardsError} Если значение не является экземпляром CardsCollection.
     */
    set collectionCards(value) {
        if (!(value instanceof CardsCollection)) {
            throw new SelectionCardsError(
                "Коллекция карт (collectionCards) должна быть экземпляром CardsCollection."
            );
        }
        this.#collectionCards = value;
    }

    // ======== GET методы ========

    /**
     * Возвращает заголовок (title).
     * @returns {string} Заголовок.
     */
    get title() {
        return this.#title;
    }

    /**
     * Возвращает описание (description).
     * @returns {string} Описание.
     */
    get description() {
        return this.#description;
    }

    /**
     * Возвращает текст расширения (textExtension).
     * @returns {string} Текст расширения.
     */
    get textExtension() {
        return this.#textExtension;
    }

    /**
     * Возвращает значение таймера.
     * @returns {number | null} Таймер.
     */
    get timer() {
        return this.#timer;
    }

    /**
     * Возвращает коллекцию карт.
     * @returns {CardsCollection | null} Коллекция карт.
     */
    get collectionCards() {
        return this.#collectionCards;
    }

    // ======== Другие методы ========

    /**
     * Преобразует объект в JSON.
     * @returns {Object} JSON-представление объекта.
     */
    toJSON() {
        return {
            title: this.#title,
            description: this.#description,
            textExtension: this.#textExtension,
            timer: this.#timer,
            collectionCards: this.#collectionCards?.getAllCards(),
        };
    }
}

module.exports = SelectionCardsHandler;
