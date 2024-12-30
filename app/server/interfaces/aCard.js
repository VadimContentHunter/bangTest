const CardError = require("../Errors/CardError");

class CardType {
    static ROLE = "role";
    static CHARACTER = "character";
    static WEAPON = "weapon";
    static DEFAULT = "default";
}

class aCard {
    _id = 0;
    _name = null;
    _image = null;
    _type = CardType.DEFAULT;
    _ownerName = "";

    constructor({ name, image, type = CardType.DEFAULT, id = 0, ownerName = "" }) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.type = type;
        this.ownerName = ownerName;

        if (new.target === aCard) {
            throw new TypeError("Нельзя создать экземпляр абстрактного класса");
        }

        // Проверка на переопределение метода action()
        if (this.action === aCard.prototype.action) {
            throw new CardError(
                `Класс-наследник ${this.constructor.name} должен реализовывать метод 'action()'`
            );
        }

        // Проверка: если статический метод initFromJSON не переопределен, выбрасываем ошибку
        if (this.constructor.initFromJSON === aCard.initFromJSON) {
            throw new TypeError(
                `Класс-наследник ${this.constructor.name} должен реализовывать метод 'static initFromJSON(data)'`
            );
        }
    }

    set id(value) {
        if (typeof value !== "number" && value < 0) {
            throw new CardError("Имя должно быть строкой.");
        }

        this._id = value;
    }

    set name(value) {
        if (typeof value !== "string") {
            throw new CardError("Имя должно быть строкой.");
        }

        this._name = value;
    }

    set image(imagePath) {
        // const fullPath = path.resolve(imagePath); // Полный путь к изображению
        // if (!fs.existsSync(fullPath)) {
        //     throw new CardError(`Файл ${fullPath} не существует.`, 3);
        // }

        this._image = imagePath;
    }

    set type(value) {
        // let l = value.toUpperCase();
        if (!Object.values(CardType).includes(value)) {
            throw new CardError("Неверный тип карты.", 4);
        }
        this._type = value;
    }

    set ownerName(value) {
        if (typeof value !== "string") {
            throw new CardError("Имя владельца должно быть строкой.");
        }

        this._ownerName = value;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get image() {
        return this._image;
    }

    get type() {
        return this._type;
    }

    get ownerName() {
        if (typeof this._ownerName !== "string") {
            throw new CardError("Имя владельца должно быть строкой.");
        }

        return this._ownerName;
    }

    action() {
        throw new CardError("Метод 'action()' должен быть реализован");
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            image: this.image,
            type: this.type,
            ownerName: this.ownerName,
            className: this.constructor.name,
        };
    }

    static initCard(data, classCards) {
        const classNameCard = data?.className; // Извлекаем имя класса карты из данных

        if (!classNameCard) {
            throw new CardError("Имя Класса карты не указано в данных.");
        }

        if (!Array.isArray(classCards)) {
            throw new CardError("Переданное значение не является массивом.");
        }

        // Проверка, что все элементы массива являются экземплярами aCard
        for (const card of classCards) {
            if (typeof card !== "function" || !(card.prototype instanceof aCard)) {
                throw new CardError(
                    `Один из элементов массива не является экземпляром aCard. Проверьте объект ${
                        card.name || "неизвестный объект"
                    }.`
                );
            }
        }

        // Найти нужный объект карты по имени его конструктора
        const cardTemplate = classCards.find((card) => card.name === classNameCard);

        if (!cardTemplate) {
            throw new CardError(`Карта с именем класса '${classNameCard}' не найдена.`);
        }

        // Проверяем, что класс реализует метод initFromJSON
        if (!(cardTemplate.prototype instanceof aCard)) {
            throw new CardError(
                `Класс '${cardTemplate.name}' не является наследником класса 'aCard'`
            );
        }

        // Создаем и возвращаем экземпляр карты
        return cardTemplate.initFromJSON(data);
    }

    /**
     * Инициализирует экземпляр из JSON-данных.
     * @param {Object} data - Данные в формате JSON.
     * @returns {aCard} Новый экземпляр.
     */
    static initFromJSON(data) {
        throw new CardError("Метод 'static initFromJSON(data)' должен быть реализован");
    }
}

module.exports = { aCard, CardType };
