const CardError = require("../Errors/CardError");
const { aCard, CardType } = require("../interfaces/aCard");

const StubCard = require("../models/cards/StubCard");
const BanditCard = require("../models/cards/roles/BanditCard");
const RenegadeCard = require("../models/cards/roles/RenegadeCard");
const SheriffCard = require("../models/cards/roles/SheriffCard");
const DeputySheriffCard = require("../models/cards/roles/DeputySheriffCard");

/**
 * Класс для управления коллекцией карт.
 */
class CardsCollection {
    /**
     * Массив допустимых типов карт.
     * @type {typeof aCard[]}
     * @static
     */
    static typesCards = [];

    constructor(cards = []) {
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

        this.setCards(cards);
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
     * @param {boolean} [overwriteId=false] - Указывает, нужно ли заменять ID карты на новое.
     * @throws {CardError} Если карта не является экземпляром aCard.
     */
    addCard(card, overwriteId = false) {
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
     * Добавляет массив карт в коллекцию.
     * @param {aCard[]} cards - Массив карт для добавления.
     * @param {boolean} [overwriteId=false] - Указывает, нужно ли заменять ID карт на новые.
     * @throws {CardError} Если карты не являются экземплярами aCard или передан не массив.
     */
    addArrayCards(cards, overwriteId = false) {
        if (!Array.isArray(cards)) {
            throw new CardError("Аргумент должен быть массивом.");
        }

        if (!cards.every((card) => card instanceof aCard)) {
            throw new CardError("Все элементы массива должны быть экземплярами aCard.");
        }

        cards.forEach((card) => this.addCard(card, overwriteId));
    }

    /**
     * Создает карту из данных и добавляет её в коллекцию.
     * @param {Object} cardData - Данные для создания карты.
     * @param {typeof aCard} classCard - Класс карты для создания.
     * @param {boolean} [overwriteId=false] - Указывает, нужно ли заменять ID карты на новое.
     */
    addCardFromData(cardData, classCard, overwriteId = false) {
        this.addCard(aCard.initCard(cardData, classCard), overwriteId);
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
     * Возвращает указанное количество случайных уникальных карт из коллекции.
     * @param {number} count - Количество карт для возвращения.
     * @param {boolean} allowPartial - Если true, возвращает все доступные карты, даже если их меньше, чем count. Если false, выбрасывает ошибку.
     * @returns {aCard[]} Массив случайных уникальных карт.
     * @throws {CardError} Если count не является числом или меньше или равно нулю.
     */
    getRandomCards(count, allowPartial = true) {
        if (typeof count !== "number" || count <= 0) {
            throw new CardError("Количество карт должно быть положительным числом.");
        }

        if (!allowPartial && count > this.cards.length) {
            throw new CardError(
                "Недостаточно карт в коллекции для возврата указанного количества."
            );
        }

        // Если allowPartial включен и count больше, чем доступно, корректируем count
        const actualCount = Math.min(count, this.cards.length);

        const randomCards = [];
        const availableCards = [...this.cards]; // Создаем копию массива карт, чтобы не изменять оригинал.

        for (let i = 0; i < actualCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const selectedCard = availableCards.splice(randomIndex, 1)[0]; // Удаляем карту из массива доступных карт.
            randomCards.push(selectedCard);
        }

        return randomCards;
    }

    /**
     * Вытаскивает карту из коллекции по её ID (удаляет её) и возвращает.
     * @param {number} id - ID карты для вытаскивания.
     * @returns {aCard} Вытаскиваемая карта.
     * @throws {CardError} Если карта с указанным ID не найдена.
     */
    pullCardById(id) {
        const cardIndex = this.cards.findIndex((card) => card.id === id);
        if (cardIndex === -1) {
            throw new CardError(`Карта с ID ${id} не найдена.`);
        }
        return this.cards.splice(cardIndex, 1)[0]; // Удаляем и возвращаем карту.
    }

    /**
     * Вытаскивает карты из коллекции по их ID (удаляет их) и возвращает.
     * Использует метод pullCardById.
     * @param {(number|aCard)[]} ids - Массив ID карт или объектов карты с полем id.
     * @returns {aCard[]} Массив вытаскиваемых карт.
     * @throws {CardError} Если хотя бы одна карта с указанным ID не найдена.
     * @throws {TypeError} Если элементы массива не являются числом или объектом с полем id.
     */
    pullCardsByIds(ids) {
        if (!Array.isArray(ids)) {
            throw new TypeError("Аргумент должен быть массивом ID или объектов карты.");
        }

        // Преобразуем массив, извлекая id из объектов карты или используя id, если это уже число.
        const validIds = ids.map((item) => {
            if (typeof item === "object" && item !== null && "id" in item) {
                return item.id; // Извлекаем id из объекта
            } else if (typeof item === "number") {
                return item; // Используем id, если это число
            } else {
                throw new TypeError(
                    "Все элементы массива должны быть либо числом, либо объектом с полем id."
                );
            }
        });

        // Используем метод pullCardById для каждого id в массиве
        return validIds.map((id) => this.pullCardById(id));
    }

    /**
     * Вытаскивает случайную карту из коллекции (удаляет её) и возвращает.
     * @returns {aCard} Случайная вытаскиваемая карта.
     * @throws {CardError} Если в коллекции нет карт.
     */
    pullRandomCard() {
        if (this.cards.length === 0) {
            throw new CardError("В коллекции нет карт.");
        }
        const randomIndex = Math.floor(Math.random() * this.cards.length);
        return this.cards.splice(randomIndex, 1)[0]; // Удаляем и возвращаем случайную карту.
    }

    /**
     * Вытаскивает указанное количество случайных карт из коллекции (удаляет их) и возвращает массив.
     * @param {number} count - Количество карт для вытаскивания.
     * @returns {aCard[]} Массив вытаскиваемых карт.
     * @throws {CardError} Если count не является числом или больше, чем количество карт в коллекции.
     */
    pullRandomCards(count) {
        if (typeof count !== "number" || count < 0) {
            throw new CardError("Количество карт должно быть положительным числом.");
        }

        if (count > this.cards.length) {
            throw new CardError(
                "Недостаточно карт в коллекции для вытаскивания указанного количества."
            );
        }

        const pulledCards = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * this.cards.length);
            pulledCards.push(this.cards.splice(randomIndex, 1)[0]); // Удаляем и добавляем в результат.
        }
        return pulledCards;
    }

    /**
     * Вытягивает все карты из коллекции (удаляет их) и возвращает массив.
     * @returns {aCard[]} Массив всех карт, которые были в коллекции.
     */
    pullAllCards() {
        const pulledCards = [...this.cards]; // Копируем текущие карты.
        this.clearCollection(); // Очищаем коллекцию.
        return pulledCards;
    }

    /**
     * Проверяет наличие карты в коллекции по её ID.
     * @param {number} id - Уникальный идентификатор карты.
     * @returns {boolean} true, если карта с указанным ID есть в коллекции, иначе false.
     * @throws {CardError} Если ID не является числом.
     */
    hasCardById(id) {
        if (typeof id !== "number") {
            throw new CardError("ID должен быть числом.");
        }
        return this.cards.some((card) => card.id === id);
    }

    /**
     * Проверяет наличие всех карт в коллекции по их ID.
     * @param {number[]} ids - Массив уникальных идентификаторов карт.
     * @returns {boolean} true, если все карты с указанными ID есть в коллекции, иначе false.
     * @throws {CardError} Если ids не является массивом или содержит нечисловые элементы.
     */
    hasCardsByIds(ids) {
        if (!Array.isArray(ids)) {
            throw new CardError("Аргумент должен быть массивом.");
        }

        // Используем метод hasCardById для проверки каждого ID
        return ids.every((id) => this.hasCardById(id));
    }

    /**
     * Очищает всю коллекцию, удаляя все карты.
     */
    clearCollection() {
        this.cards = [];
        this.nextId = 1; // Сбрасываем счетчик ID.
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

        // try {
        const cardCollectionArray =
            typeof inputData === "string" ? JSON.parse(inputData) : inputData;
        const cardDataArray = cardCollectionArray?.cards;

        if (!Array.isArray(cardDataArray)) {
            throw new TypeError("Данные должны быть массивом объектов карт.");
        }

        cardDataArray.forEach((cardData) => {
            cardCollection.addCardFromData(cardData, CardsCollection.typesCards, overwriteId);
        });
        // } catch (error) {
        //     throw new CardError("Ошибка при инициализации карт из JSON или массива:", error);
        // }

        return cardCollection;
    }
}

module.exports = CardsCollection;
