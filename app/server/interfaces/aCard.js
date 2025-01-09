const CardError = require("../Errors/CardError");

/**
 * Класс типов карт.
 */
class CardType {
    static ROLE = "role";
    static CHARACTER = "character";
    static WEAPON = "weapon";
    static DEFAULT = "default";
    static CONST = "const";
}

/**
 * Класс мастей для карт.
 */
class CardSuit {
    static HEARTS = "черва"; // Масть червей
    static DIAMONDS = "бубна"; // Масть бубен
    static CLUBS = "креста"; // Масть крестов
    static SPADES = "пика"; // Масть пик
    static NONE = "none";
}

class CardRank {
    static TWO = "2";
    static THREE = "3";
    static FOUR = "4";
    static FIVE = "5";
    static SIX = "6";
    static SEVEN = "7";
    static EIGHT = "8";
    static NINE = "9";
    static TEN = "10";
    static JACK = "Jack";
    static QUEEN = "Queen";
    static KING = "King";
    static ACE = "Ace";
    static NONE = "none";
}

/**
 * Абстрактный класс для карты.
 */
class aCard {
    #id = 0;
    #name = null;
    #image = null;
    #type = CardType.DEFAULT;
    #ownerName = "";
    #suit = null;
    #rank = null;

    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} params.name - Название карты.
     * @param {string} params.image - Путь к изображению карты.
     * @param {string} [params.type=CardType.DEFAULT] - Тип карты.
     * @param {number} [params.id=0] - ID карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({
        name,
        image,
        type = CardType.DEFAULT,
        id = 0,
        ownerName = "",
        suit = CardSuit.NONE,
        rank = CardRank.NONE,
    }) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.type = type;
        this.ownerName = ownerName;
        this.suit = suit;
        this.rank = rank;

        if (new.target === aCard) {
            throw new TypeError("Нельзя создать экземпляр абстрактного класса");
        }

        // Проверка на переопределение метода action()
        if (this.action === aCard.prototype.action) {
            throw new CardError(
                `Класс-наследник ${this.constructor.name} должен реализовывать метод 'action()'`
            );
        }

        // Проверка на переопределение метода getActionCallCount()
        // if (this.getActionCallCount === aCard.prototype.getActionCallCount) {
        //     throw new CardError(
        //         `Класс-наследник ${this.constructor.name} должен реализовывать метод 'getActionCallCount()'`
        //     );
        // }

        // Проверка: если статический метод initFromJSON не переопределен, выбрасываем ошибку
        if (this.constructor.initFromJSON === aCard.initFromJSON) {
            throw new TypeError(
                `Класс-наследник ${this.constructor.name} должен реализовывать метод 'static initFromJSON(data)'`
            );
        }
    }

    /**
     * Устанавливает ID карты.
     * @param {number} value - Значение ID карты.
     * @throws {CardError} Если ID не является положительным числом.
     */
    set id(value) {
        if (typeof value !== "number" || value < 0) {
            throw new CardError("ID должен быть положительным числом.");
        }
        this.#id = value;
    }

    /**
     * Устанавливает имя карты.
     * @param {string} value - Имя карты.
     * @throws {CardError} Если имя не является строкой.
     */
    set name(value) {
        if (typeof value !== "string") {
            throw new CardError("Имя должно быть строкой.");
        }
        this.#name = value;
    }

    /**
     * Устанавливает путь к изображению карты.
     * @param {string} imagePath - Путь к изображению.
     */
    set image(imagePath) {
        this.#image = imagePath;
    }

    /**
     * Устанавливает тип карты.
     * @param {string} value - Тип карты.
     * @throws {CardError} Если тип карты неверен.
     */
    set type(value) {
        if (!Object.values(CardType).includes(value)) {
            throw new CardError("Неверный тип карты.");
        }
        this.#type = value;
    }

    /**
     * Устанавливает имя владельца карты.
     * @param {string} value - Имя владельца.
     * @throws {CardError} Если имя владельца не является строкой.
     */
    set ownerName(value) {
        if (typeof value !== "string") {
            throw new CardError("Имя владельца должно быть строкой.");
        }
        this.#ownerName = value;
    }

    /**
     * Устанавливает масть карты.
     * @param {string} value - Масть карты или null.
     * @throws {CardError} Если масть не является строкой или null.
     */
    set suit(value) {
        if (!Object.values(CardSuit).includes(value)) {
            throw new CardError("Неверная масть карты.");
        }
        this.#suit = value;
    }

    /**
     * Устанавливает ранг карты.
     * @param {string} value - Новый ранг карты.
     * @throws {Error} Если переданный ранг невалиден.
     */
    set rank(value) {
        if (!Object.values(CardRank).includes(value)) {
            throw new CardError("Неверный ранг карты.");
        }

        this.#rank = value;
    }

    /**
     * Получает ID карты.
     * @returns {number} ID карты.
     */
    get id() {
        return this.#id;
    }

    /**
     * Получает имя карты.
     * @returns {string} Имя карты.
     */
    get name() {
        return this.#name;
    }

    /**
     * Получает путь к изображению карты.
     * @returns {string} Путь к изображению.
     */
    get image() {
        return this.#image;
    }

    /**
     * Получает тип карты.
     * @returns {string} Тип карты.
     */
    get type() {
        return this.#type;
    }

    /**
     * Получает имя владельца карты.
     * @returns {string} Имя владельца карты.
     * @throws {CardError} Если имя владельца не является строкой.
     */
    get ownerName() {
        if (typeof this.#ownerName !== "string") {
            throw new CardError("Имя владельца должно быть строкой.");
        }
        return this.#ownerName;
    }

    /**
     * Получает масть карты.
     * @returns {string|null} Масть карты.
     */
    get suit() {
        return this.#suit;
    }

    /**
     * Возвращает ранг карты.
     * @returns {string|null} Ранг карты.
     */
    get rank() {
        return this.#rank;
    }

    /**
     * Абстрактный метод для действия карты.
     * Этот метод должен быть реализован в дочерних классах.
     * @throws {CardError} Если метод не переопределен в дочернем классе.
     */
    action() {
        throw new CardError("Метод 'action()' должен быть реализован");
    }

    /**
     * Абстрактный метод для получения количества вызовов метода action.
     * Этот метод должен быть реализован в дочерних классах.
     * @returns {number} Количество вызовов метода action.
     * @throws {CardError} Если метод не переопределен в дочернем классе.
     */
    // getActionCallCount() {
    //     throw new CardError("Метод 'getActionCallCount()' должен быть реализован");
    // }

    /**
     * Преобразует объект карты в формат JSON.
     * @returns {Object} Объект карты в формате JSON.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            image: this.image,
            type: this.type,
            ownerName: this.ownerName,
            suit: this.suit,
            className: this.constructor.name,
        };
    }

    /**
     * Инициализирует карту из JSON-данных.
     * @param {Object} data - Данные карты в формате JSON.
     * @param {Array} classCards - Массив классов карт.
     * @returns {aCard} Экземпляр карты.
     * @throws {CardError} Если не найдено имя класса карты или класс не является наследником aCard.
     */
    static initCard(data, classCards) {
        const classNameCard = data?.className;

        if (!classNameCard) {
            throw new CardError("Имя Класса карты не указано в данных.");
        }

        if (!Array.isArray(classCards)) {
            throw new CardError("Переданное значение не является массивом.");
        }

        for (const card of classCards) {
            if (typeof card !== "function" || !(card.prototype instanceof aCard)) {
                throw new CardError(
                    `Один из элементов массива не является экземпляром aCard. Проверьте объект ${
                        card.name || "неизвестный объект"
                    }.`
                );
            }
        }

        const cardTemplate = classCards.find((card) => card.name === classNameCard);

        if (!cardTemplate) {
            throw new CardError(`Карта с именем класса '${classNameCard}' не найдена.`);
        }

        if (!(cardTemplate.prototype instanceof aCard)) {
            throw new CardError(
                `Класс '${cardTemplate.name}' не является наследником класса 'aCard'`
            );
        }

        return cardTemplate.initFromJSON(data);
    }

    /**
     * Статический метод для инициализации карты из JSON-данных.
     * Этот метод должен быть переопределен в дочерних классах.
     * @param {Object} data - Данные карты в формате JSON.
     * @returns {aCard} Новый экземпляр карты.
     * @throws {CardError} Если метод не переопределен в дочернем классе.
     */
    static initFromJSON(data) {
        throw new CardError("Метод 'static initFromJSON(data)' должен быть реализован");
    }
}

module.exports = { aCard, CardType, CardSuit, CardRank };
