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

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            image: this.image,
            type: this.type,
            ownerName: this.ownerName,
        };
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
