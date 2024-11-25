const CardError = require("../Errors/CardError");
const fs = require("fs");
const path = require("path");

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

    constructor(name, image, type = CardType.DEFAULT, id = 0) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.type = type;
    }

    set id(value) {
        if (typeof value !== "number" && value < 0) {
            throw new ValidatePlayerError("Имя должно быть строкой.");
        }

        this._id = value;
    }

    set name(value) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой.");
        }

        this._name = value;
    }

    set image(imagePath) {
        const fullPath = path.resolve(imagePath); // Полный путь к изображению
        if (!fs.existsSync(fullPath)) {
            throw new CardError(`Файл ${fullPath} не существует.`, 3);
        }

        this._image = imagePath;
    }

    set type(value) {
        if (!Object.values(CardType).includes(value)) {
            throw new CardError("Неверный тип карты.", 4);
        }
        this._type = value;
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
}

module.exports = { aCard, CardType };