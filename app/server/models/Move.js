const MoveError = require("../Errors/MoveError");
const PlayerCollection = require("../handlers/PlayerCollection");
const CardsCollection = require("../handlers/CardsCollection");

class Move {
    _moveNumber = null;
    _playersBeforeMove = null;
    _playersAfterMove = null;
    _dateTime = null;
    _description = null;
    _mainDeck = null; // Главная колода
    _discardDeck = null; // Колода сброса

    /**
     * Конструктор для модели "Ход".
     * @param {number} moveNumber - Номер хода.
     * @param {PlayerCollection} playersBeforeMove - Коллекция игроков до хода.
     * @param {PlayerCollection} playersAfterMove - Коллекция игроков после хода.
     * @param {Date} dateTime - Дата и время хода.
     * @param {string} description - Описание хода.
     * @param {CardsCollection} mainDeck - Главная колода.
     * @param {CardsCollection} discardDeck - Колода сброса.
     */
    constructor(
        moveNumber,
        description = "",
        playersBeforeMove = null,
        playersAfterMove = null,
        dateTime = null,
        mainDeck = null,
        discardDeck = null
    ) {
        this.moveNumber = moveNumber;
        this.playersBeforeMove = playersBeforeMove ?? new PlayerCollection();
        this.playersAfterMove = playersAfterMove ?? new PlayerCollection();
        this.dateTime = dateTime ?? new Date();
        this.description = description;
        this.mainDeck = mainDeck ?? new CardsCollection();
        this.discardDeck = discardDeck ?? new CardsCollection();
    }

    // Геттер и сеттер для номера хода
    get moveNumber() {
        if (typeof this._moveNumber !== "number" || this._moveNumber <= 0) {
            throw new MoveError("Номер хода должен быть положительным числом.");
        }
        return this._moveNumber;
    }

    set moveNumber(value) {
        if (typeof value !== "number" || value <= 0) {
            throw new MoveError("Номер хода должен быть положительным числом.");
        }
        this._moveNumber = value;
    }

    // Геттер и сеттер для игроков до хода
    get playersBeforeMove() {
        if (!(this._playersBeforeMove instanceof PlayerCollection)) {
            throw new MoveError("playersBeforeMove должен быть экземпляром PlayerCollection.");
        }
        return this._playersBeforeMove;
    }

    set playersBeforeMove(value) {
        if (!(value instanceof PlayerCollection)) {
            throw new MoveError("playersBeforeMove должен быть экземпляром PlayerCollection.");
        }
        this._playersBeforeMove = value;
    }

    // Геттер и сеттер для игроков после хода
    get playersAfterMove() {
        if (!(this._playersAfterMove instanceof PlayerCollection)) {
            throw new MoveError("playersAfterMove должен быть экземпляром PlayerCollection.");
        }
        return this._playersAfterMove;
    }

    set playersAfterMove(value) {
        if (!(value instanceof PlayerCollection)) {
            throw new MoveError("playersAfterMove должен быть экземпляром PlayerCollection.");
        }
        this._playersAfterMove = value;
    }

    // Геттер и сеттер для даты и времени
    get dateTime() {
        if (!(this._dateTime instanceof Date)) {
            throw new MoveError("dateTime должен быть экземпляром Date.");
        }
        return this._dateTime;
    }

    set dateTime(value) {
        if (!(value instanceof Date)) {
            throw new MoveError("dateTime должен быть экземпляром Date.");
        }
        this._dateTime = value;
    }

    // Геттер и сеттер для описания хода
    get description() {
        if (typeof this._description !== "string") {
            throw new MoveError("description должно быть строкой.");
        }
        return this._description;
    }

    set description(value) {
        if (typeof value !== "string") {
            throw new MoveError("description должно быть строкой.");
        }
        this._description = value;
    }

    // Геттер и сеттер для главной колоды
    get mainDeck() {
        if (!(this._mainDeck instanceof CardsCollection)) {
            throw new MoveError("mainDeck должен быть экземпляром CardsCollection.");
        }
        return this._mainDeck;
    }

    set mainDeck(value) {
        if (!(value instanceof CardsCollection)) {
            throw new MoveError("mainDeck должен быть экземпляром CardsCollection.");
        }
        this._mainDeck = value;
    }

    // Геттер и сеттер для колоды сброса
    get discardDeck() {
        if (!(this._discardDeck instanceof CardsCollection)) {
            throw new MoveError("discardDeck должен быть экземпляром CardsCollection.");
        }
        return this._discardDeck;
    }

    set discardDeck(value) {
        if (!(value instanceof CardsCollection)) {
            throw new MoveError("discardDeck должен быть экземпляром CardsCollection.");
        }
        this._discardDeck = value;
    }

    getFormattedDateTime() {
        const date = this._dateTime;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${hours}.${minutes}.${seconds}; day: ${day}`;
    }

    /**
     * @returns {Object} JSON-представление
     */
    toJSON() {
        return {
            moveNumber: this.moveNumber,
            description: this.description,
            dateTime: this.dateTime.toISOString(),
            formattedDateTime: this.getFormattedDateTime(),
            playersBeforeMove: this.playersBeforeMove,
            playersAfterMove: this.playersAfterMove,
            mainDeck: this.mainDeck,
            discardDeck: this.discardDeck,
        };
    }

    /**
     * Статический метод для инициализации объекта Move из строки JSON.
     * @param {string} jsonString - Строка JSON, содержащая данные для хода.
     * @returns {Move} Новый объект Move.
     */
    static initFromJSON(jsonString) {
        try {
            // Парсим JSON строку
            const data = JSON.parse(jsonString);

            // Проверяем, что в JSON есть все необходимые поля
            if (
                typeof data.moveNumber !== "number" ||
                !(data.playersBeforeMove instanceof Array) ||
                !(data.playersAfterMove instanceof Array) ||
                !(data.dateTime instanceof String) ||
                typeof data.description !== "string"
            ) {
                throw new Error("Некорректный формат данных в JSON.");
            }

            // Создаем объект PlayerCollection для игроков до и после хода
            const playersBeforeMove = new PlayerCollection(data.playersBeforeMove);
            const playersAfterMove = new PlayerCollection(data.playersAfterMove);
            const mainDeck = new CardsCollection(data.mainDeck);
            const discardDeck = new CardsCollection(data.discardDeck);

            // Создаем объект Move и инициализируем его данными из JSON
            const move = new Move(
                data.moveNumber,
                data.description,
                playersBeforeMove,
                playersAfterMove,
                new Date(data.dateTime),
                mainDeck,
                discardDeck
            );

            return move;
        } catch (error) {
            throw new Error("Ошибка при инициализации Move из JSON: " + error.message);
        }
    }
}

module.exports = Move;
