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
    static JACK = "J";
    static QUEEN = "Q";
    static KING = "K";
    static ACE = "A";
    static NONE = "none";

    static ranks = [
        CardRank.TWO,
        CardRank.THREE,
        CardRank.FOUR,
        CardRank.FIVE,
        CardRank.SIX,
        CardRank.SEVEN,
        CardRank.EIGHT,
        CardRank.NINE,
        CardRank.TEN,
        CardRank.JACK,
        CardRank.QUEEN,
        CardRank.KING,
        CardRank.ACE,
        CardRank.NONE,
    ];

    /**
     * Проверяет, находится ли указанный ранг карты в заданном диапазоне.
     * @param {string} rank - Ранг карты для проверки (например, "2", "J", "A").
     * @param {string} minRank - Минимальный ранг диапазона.
     * @param {string} maxRank - Максимальный ранг диапазона.
     * @returns {boolean} - Возвращает true, если ранг находится в диапазоне, иначе false.
     */
    static isRankInRange(rank, minRank, maxRank) {
        const rankIndex = CardRank.ranks.indexOf(rank);
        const minIndex = CardRank.ranks.indexOf(minRank);
        const maxIndex = CardRank.ranks.indexOf(maxRank);

        if (rankIndex === -1 || minIndex === -1 || maxIndex === -1) {
            throw new Error("Invalid rank provided.");
        }

        return rankIndex >= minIndex && rankIndex <= maxIndex;
    }
}

/**
 * Абстрактный класс для карты.
 */
class aCard {
    _id = 0;
    _name = null;
    _image = null;
    _type = CardType.DEFAULT;
    _ownerName = "";
    _targetName = "";
    _suit = null;
    _rank = null;
    _distance = 0;
    _damage = 0;
    _healAmount = 0;

    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} params.name - Название карты.
     * @param {string} params.image - Путь к изображению карты.
     * @param {string} [params.type=CardType.DEFAULT] - Тип карты.
     * @param {number} [params.id=0] - ID карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.targetName=""] - Имя Цели карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({
        name,
        image,
        type = CardType.DEFAULT,
        id = 0,
        ownerName = "",
        targetName = "",
        suit = CardSuit.NONE,
        rank = CardRank.NONE,
        distance = 0,
        damage = 0,
        healAmount = 0,
    }) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.type = type;
        this.ownerName = ownerName;
        this.targetName = targetName;
        this.suit = suit;
        this.rank = rank;
        this.distance = distance;
        this.damage = damage;
        this.healAmount = healAmount;

        if (new.target === aCard) {
            throw new TypeError("Нельзя создать экземпляр абстрактного класса");
        }

        // Проверка на переопределение метода action()
        if (this.action === aCard.prototype.action) {
            throw new CardError(
                `Класс-наследник ${this.constructor.name} должен реализовывать метод 'action()'`
            );
        }

        if (this.destroy === aCard.prototype.destroy) {
            throw new CardError(
                `Класс-наследник ${this.constructor.name} должен реализовывать метод 'destroy()'`
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
        this._id = value;
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
        this._name = value;
    }

    /**
     * Устанавливает путь к изображению карты.
     * @param {string} imagePath - Путь к изображению.
     */
    set image(imagePath) {
        this._image = imagePath;
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
        this._type = value;
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
        this._ownerName = value;
    }

    /**
     * @param {string} value - Имя цели.
     * @throws {CardError} Если имя владельца не является строкой.
     */
    set targetName(value) {
        if (typeof value !== "string") {
            throw new CardError("Имя цели должно быть строкой.");
        }
        this._targetName = value;
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
        this._suit = value;
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

        this._rank = value;
    }

    /**
     * @param {number} value
     * @throws {CardError} Если параметр 'damage' не является положительным целым числом.
     */
    set damage(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new CardError("Параметр 'damage' должен быть положительным целым числом или 0.");
        }
        this._damage = value;
    }

    /**
     * @param {number} value
     * @throws {CardError} Если значение не является целым числом или меньше 0.
     */
    set healAmount(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new CardError("healAmount должно быть целым числом и не меньше 0.");
        }
        this._healAmount = value;
    }

    /**
     * Сеттер для дистанции.
     * @param {number} value - Установить дистанцию.
     * @throws {CardError} Если distance не является положительным целым числом.
     */
    set distance(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new CardError("distance должен быть положительным целым числом или 0.");
        }
        this._distance = value;
    }

    /**
     * Получает ID карты.
     * @returns {number} ID карты.
     */
    get id() {
        return this._id;
    }

    /**
     * Получает имя карты.
     * @returns {string} Имя карты.
     */
    get name() {
        return this._name;
    }

    /**
     * Получает путь к изображению карты.
     * @returns {string} Путь к изображению.
     */
    get image() {
        return this._image;
    }

    /**
     * Получает тип карты.
     * @returns {string} Тип карты.
     */
    get type() {
        return this._type;
    }

    /**
     * Получает имя владельца карты.
     * @returns {string} Имя владельца карты.
     * @throws {CardError} Если имя владельца не является строкой.
     */
    get ownerName() {
        if (typeof this._ownerName !== "string") {
            throw new CardError("Имя владельца должно быть строкой.");
        }
        return this._ownerName;
    }

    /**
     * Получает имя цели карты.
     * @returns {string} Имя цели карты.
     * @throws {CardError} Если имя владельца не является строкой.
     */
    get targetName() {
        if (typeof this._targetName !== "string") {
            throw new CardError("Имя цели должно быть строкой.");
        }
        return this._targetName;
    }

    /**
     * Получает масть карты.
     * @returns {string|null} Масть карты.
     */
    get suit() {
        return this._suit;
    }

    /**
     * Возвращает ранг карты.
     * @returns {string|null} Ранг карты.
     */
    get rank() {
        return this._rank;
    }

    /**
     * @returns {number}
     */
    get damage() {
        return this._damage;
    }

    /**
     * @returns {number} Значение healAmount.
     */
    get healAmount() {
        return this._healAmount;
    }

    /**
     * Геттер для дистанции оружия.
     * @returns {number} Дистанция оружия.
     */
    get distance() {
        return this._distance;
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
     * Освобождает ресурсы объекта или выполняет завершающие действия перед его удалением.
     * Этот метод должен быть реализован в подклассе.
     * @throws {CardError} Если метод не реализован.
     */
    destroy() {
        throw new CardError("Метод 'destroy()' должен быть реализован");
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
            targetName: this.targetName,
            suit: this.suit,
            rank: this.rank,
            className: this.constructor.name,
            distance: this.distance,
            damage: this.damage,
            healAmount: this.healAmount,
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
