const CardError = require("../Errors/CardError");
const { aCard, CardType } = require("../interfaces/aCard");

const StubCard = require("../models/cards/StubCard");

/**
 * Класс для управления коллекцией карт.
 */
class CardsCollection {
    /**
     * Массив допустимых типов карт.
     * @type {typeof aCard[]}
     * @static
     */
    static typesCards = [StubCard];

    constructor() {
        /**
         * Массив карт в коллекции.
         * @type {aCard[]}
         * @private
         */
        this.cards = [];

        /**
         * Следующий доступный ID для карты.
         * @type {number}
         * @private
         */
        this.nextId = 1; // Начальное значение для генерации ID.
    }

    /**
     * Генерирует уникальный ID для карты.
     * @private
     * @returns {number} Новый уникальный ID.
     */
    generateId() {
        return this.nextId++;
    }

    /**
     * Устанавливает массив карт в коллекцию.
     * @param {aCard[]} cards - Массив экземпляров aCard.
     * @param {boolean} [overwriteId=true] - Указывает, нужно ли заменять ID карт на новые.
     * @throws {CardError} Если аргумент не массив, массив пуст, или элементы не являются экземплярами aCard.
     */
    setCards(cards, overwriteId = true) {
        if (!Array.isArray(cards)) {
            throw new CardError("Аргумент должен быть массивом.");
        }

        if (cards.length === 0) {
            this.cards = [];
            return;
        }

        if (!cards.every((card) => card instanceof aCard)) {
            throw new CardError("Все элементы массива должны быть экземплярами aCard.");
        }

        this.cards = cards.map((card) => {
            if (overwriteId || typeof card.id !== "number" || card.id <= 0) {
                card.id = this.generateId();
            }
            return card;
        });
    }

    /**
     * Добавляет одну карту в коллекцию.
     * @param {aCard} card - Карта для добавления.
     * @param {boolean} [overwriteId=true] - Указывает, нужно ли заменять ID карты на новое.
     * @throws {CardError} Если карта не является экземпляром aCard.
     */
    addCard(card, overwriteId = true) {
        if (!(card instanceof aCard)) {
            throw new CardError("Объект карты должен быть экземпляром aCard.");
        }

        if (overwriteId || typeof card.id !== "number" || card.id <= 0) {
            card.id = this.generateId();
        } else if (this.cards.some((existingCard) => existingCard.id === card.id)) {
            throw new CardError(`Карта с ID ${card.id} уже существует.`);
        }

        this.cards.push(card);
    }

    /**
     * Создает карту из данных и добавляет её в коллекцию.
     * @param {Object} cardData - Данные для создания карты.
     * @param {typeof aCard} classCard - Класс карты для создания.
     * @param {boolean} [overwriteId=true] - Указывает, нужно ли заменять ID карты на новое.
     */
    addCardFromData(cardData, classCard, overwriteId = true) {
        this.addCard(aCard.initCard(cardData, [classCard]), overwriteId);
    }

    /**
     * Возвращает количество карт в коллекции, которые являются экземплярами aCard.
     * @returns {number} Количество карт в коллекции.
     */
    countCards() {
        return this.cards.filter((card) => card instanceof aCard).length;
    }

    /**
     * Возвращает карту по её ID.
     * @param {number} id - Уникальный идентификатор карты.
     * @returns {aCard} Карта с указанным ID.
     * @throws {CardError} Если карта с указанным ID не найдена.
     */
    getCardById(id) {
        if (typeof id !== "number") {
            throw new CardError("ID должен быть числом.");
        }

        const card = this.cards.find((card) => card.id === id);
        if (!card) {
            throw new CardError(`Карта с ID ${id} не найдена.`);
        }
        return card;
    }

    /**
     * Возвращает карту по её имени.
     * @param {string} name - Имя карты.
     * @returns {aCard} Карта с указанным именем.
     * @throws {CardError} Если карта с указанным именем не найдена.
     */
    getCardByName(name) {
        if (typeof name !== "string") {
            throw new CardError("Имя должно быть строкой.");
        }

        const card = this.cards.find((card) => card.name === name);
        if (!card) {
            throw new CardError(`Карта с именем ${name} не найдена.`);
        }
        return card;
    }

    /**
     * Возвращает массив карт по их ID.
     * @param {number[]} ids - Массив ID карт.
     * @returns {aCard[]} Массив карт с указанными ID.
     * @throws {CardError} Если аргумент не является массивом или содержит не числа.
     */
    getCardsByIds(ids) {
        if (!Array.isArray(ids)) {
            throw new CardError("Аргумент должен быть массивом.");
        }

        if (!ids.every((id) => typeof id === "number")) {
            throw new CardError("Массив должен содержать только числа.");
        }

        return this.cards.filter((card) => ids.includes(card.id));
    }

    /**
     * Возвращает массив карт по их типу.
     * @param {string} type - Тип карты (например, из CardType).
     * @returns {aCard[]} Массив карт указанного типа.
     * @throws {CardError} Если тип карты не является строкой или не соответствует допустимым значениям.
     */
    getCardsByType(type) {
        if (typeof type !== "string") {
            throw new CardError("Тип карты должен быть строкой.");
        }

        if (!Object.values(CardType).includes(type)) {
            throw new CardError(`Недопустимый тип карты: ${type}.`);
        }

        return this.cards.filter((card) => card.type === type);
    }

    /**
     * Возвращает все карты в коллекции.
     * @returns {aCard[]} Копия массива всех карт.
     */
    getAllCards() {
        return [...this.cards];
    }

    /**
     * Возвращает JSON-представление коллекции карт.
     * @returns {Object} Объект с массивом карт и их количеством.
     */
    toJSON() {
        return {
            cards: this.cards,
            countCards: this.countCards(),
        };
    }

    /**
     * Инициализирует коллекцию из JSON-данных.
     * @param {string|Object[]} inputData - JSON-строка или массив объектов карт.
     * @param {boolean} [overwriteId=true] - Указывает, нужно ли заменять ID карт на новые.
     * @returns {CardsCollection} Новая коллекция карт.
     */
    static initFromJSON(inputData, overwriteId = true) {
        const cardCollection = new CardsCollection();

        try {
            const cardCollectionArray = typeof inputData === "string" ? JSON.parse(inputData) : inputData;
            const cardDataArray = cardCollectionArray?.cards;

            if (!Array.isArray(cardDataArray)) {
                throw new TypeError("Данные должны быть массивом объектов карт.");
            }

            cardDataArray.forEach((cardData) => {
                cardCollection.addCardFromData(cardData, CardsCollection.typesCards, overwriteId);
            });
        } catch (error) {
            throw new CardError("Ошибка при инициализации карт из JSON или массива:", error);
        }

        return cardCollection;
    }
}

module.exports = CardsCollection;
