const MoveError = require("../Errors/MoveError");
const PlayerCollection = require("../handlers/PlayerCollection");

class Move {
    _moveNumber = null;
    _playersBeforeMove = null;
    _playersAfterMove = null;
    _dateTime = null;
    _description = null;

    /**
     * Конструктор для модели "Ход".
     * @param {number} moveNumber - Номер хода.
     * @param {PlayerCollection} playersBeforeMove - Коллекция игроков до хода.
     * @param {PlayerCollection} playersAfterMove - Коллекция игроков после хода.
     * @param {Date} dateTime - Дата и время хода.
     * @param {string} description - Описание хода.
     */
    constructor(
        moveNumber,
        description = "",
        playersBeforeMove = null,
        playersAfterMove = null,
        dateTime = null
    ) {
        this.moveNumber = moveNumber;
        this.playersBeforeMove = playersBeforeMove ?? new PlayerCollection();
        this.playersAfterMove = playersAfterMove ?? new PlayerCollection();
        this.dateTime = dateTime ?? new Date();
        this.description = description;
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
}

module.exports = Move;
