const CardError = require("../Errors/CardError");
const { aCard, CardType } = require("../interfaces/aCard");

class CardsCollection {
    constructor() {
        /**
         * @type {aCard[]}
         * @private
         */
        this.cards = [];
    }

    /**
     * Устанавливает массив карт в коллекцию.
     * @param {aCard[]} cards - Массив экземпляров aCard.
     * @throws {CardError} Если аргумент не массив, массив пуст, или элементы не являются экземплярами aCard.
     */
    setCards(cards) {
        if (!Array.isArray(cards)) {
            throw new CardError("Аргумент должен быть массивом.");
        }

        // Если массив пустой, просто очищаем коллекцию.
        if (cards.length === 0) {
            this.cards = [];
            return;
        }

        if (!cards.every((card) => card instanceof aCard) && cards.length > 0) {
            throw new CardError("Все элементы массива должны быть экземплярами aCard.");
        }

        this.cards = [...cards];
    }

    /**
     * Добавляет одну карту в коллекцию.
     * @param {aCard} card - Карта для добавления.
     * @throws {CardError} Если карта не является экземпляром aCard.
     */
    addCard(card) {
        if (!(card instanceof aCard)) {
            throw new CardError("Объект карты должен быть экземпляром aCard.");
        }

        this.cards.push(card);
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

    toJSON() {
        return {
            cards: this.cards,
            countCards: this.countCards(),
        };
    }
}

module.exports = CardsCollection;
