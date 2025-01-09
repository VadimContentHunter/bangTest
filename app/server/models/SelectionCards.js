const Player = require("./Player"); // Подключение модели Player
const SelectionCardsError = require("../Errors/SelectionCardsError"); // Подключение ошибки
const CardsCollection = require("../handlers/CardsCollection");
const { aCard } = require("../interfaces/aCard");

class SelectionCards {
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

    /** @type {number} */
    #selectionCount = 0;

    /** @type {number[]} */
    #selectedIndices = [];

    /** @type {boolean} */
    #isWaitingForResponse = false;

    /**
     * Конструктор класса SelectionCards.
     * @param {Object} config - Конфигурация для инициализации.
     * @param {string} [config.title=""] - Заголовок.
     * @param {string} [config.description=""] - Описание.
     * @param {string} [config.textExtension=""] - Текст расширения.
     * @param {aCard[]} [config.collectionCards=[]] - Коллекция карт.
     * @param {number} [config.selectionCount=0] - Количество выборов.
     * @param {number | null} [config.timer=null] - Таймер.
     * @param {boolean} [config.isWaitingForResponse=true] - Состояние ожидания ответа.
     */
    constructor({
        title = "",
        description = "",
        textExtension = "",
        collectionCards = [],
        selectionCount = 0,
        selectedIndices = [],
        timer = null,
        isWaitingForResponse = true,
    }) {
        this.title = title;
        this.description = description;
        this.textExtension = textExtension;
        this.selectionCount = selectionCount;
        this.timer = timer;
        this.collectionCards = new CardsCollection();
        this.collectionCards.setCards(collectionCards, false);
        this.selectedIndices = selectedIndices;
        this.isWaitingForResponse = isWaitingForResponse;
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
     * Устанавливает количество выборов (selectionCount).
     * @param {number} value - Целое число, представляющее количество выборов.
     * @throws {SelectionCardsError} Если значение не является целым числом или меньше нуля.
     */
    set selectionCount(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new SelectionCardsError(
                "Количество выборов (selectionCount) должно быть неотрицательным целым числом."
            );
        }
        this.#selectionCount = value;
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

    /**
     * Устанавливает массив выбранных ID.
     * @param {number[] | aCard[]} indices - Массив ID или объектов aCard.
     * @throws {SelectionCardsError} Если элементы массива не являются числами или экземплярами aCard.
     */
    set selectedIndices(indices) {
        if (!Array.isArray(indices)) {
            throw new SelectionCardsError("Аргумент должен быть массивом.");
        }

        if (!indices.every((item) => typeof item === "number" || item instanceof aCard)) {
            throw new SelectionCardsError(
                "Элементы массива должны быть числами или экземплярами aCard."
            );
        }

        this.#selectedIndices = indices.map((item) => (item instanceof aCard ? item.id : item));
    }

    /**
     * Устанавливает состояние ожидания ответа.
     * @param {boolean} value - True, если сервер ожидает ответа.
     * @throws {SelectionCardsError} Если значение не булевое.
     */
    set isWaitingForResponse(value) {
        if (typeof value !== "boolean") {
            throw new SelectionCardsError("Состояние ожидания должно быть булевым значением.");
        }
        this.#isWaitingForResponse = value;
    }

    /**
     * Добавляет ID или объект aCard в выбранные элементы.
     * @param {number | aCard} index - ID карты или объект aCard.
     * @throws {SelectionCardsError} Если аргумент не число и не объект aCard.
     */
    addSelectedIndex(index) {
        if (typeof index === "number") {
            if (!this.#selectedIndices.includes(index)) {
                this.#selectedIndices.push(index);
            }
        } else if (index instanceof aCard) {
            if (!this.#selectedIndices.includes(index.id)) {
                this.#selectedIndices.push(index.id);
            }
        } else {
            throw new SelectionCardsError("Аргумент должен быть числом или экземпляром aCard.");
        }
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
     * Возвращает количество выборов (selectionCount).
     * @returns {number} Количество выборов.
     */
    get selectionCount() {
        return this.#selectionCount;
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

    /**
     * Возвращает массив выбранных ID.
     * @returns {number[]} Массив ID выбранных карт.
     */
    get selectedIndices() {
        return [...this.#selectedIndices];
    }

    /**
     * Возвращает состояние ожидания ответа.
     * @returns {boolean} True, если сервер ожидает ответа.
     */
    get isWaitingForResponse() {
        return this.#isWaitingForResponse;
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
            selectionCount: this.#selectionCount,
            timer: this.#timer,
            collectionCards: this.#collectionCards?.getAllCards(),
            selectedIndices: this.#selectedIndices,
            isWaitingForResponse: this.#isWaitingForResponse,
        };
    }
}

module.exports = SelectionCards;
