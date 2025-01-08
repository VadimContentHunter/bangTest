const MoveError = require("../Errors/MoveError");
const PlayerCollection = require("../handlers/PlayerCollection");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const GameTable = require("../models/GameTable");

class Move {
    #moveNumber = null;
    #players = null;
    #dateTime = null;
    #description = null;
    #playersDistances = null;
    #gameTable = null;

    /**
     * Конструктор для модели "Ход".
     * @param {Object} params - Параметры хода.
     * @param {number} params.moveNumber - Номер хода.
     * @param {string} [params.description=""] - Описание хода.
     * @param {PlayerCollection} [params.players=null] - Коллекция игроков после хода.
     * @param {Date} [params.dateTime=null] - Дата и время хода.
     * @param {DistanceHandler} [params.playersDistances=null] - Расстояния между игроками.
     * @param {GameTable} [params.gameTable=null] - Игровая таблица.
     */
    constructor({
        moveNumber = null,
        description = "",
        players = null,
        dateTime = null,
        playersDistances = null,
        gameTable = null,
    }) {
        this.moveNumber = moveNumber;
        this.players = players ?? new PlayerCollection();
        this.dateTime = dateTime ?? new Date();
        this.description = description;
        this.playersDistances = playersDistances ?? new DistanceHandler();
        this.gameTable = gameTable ?? new GameTable();
    }

    // Геттер и сеттер для gameTable
    /**
     * @returns {GameTable|null}
     */
    get gameTable() {
        if (!(this.#gameTable instanceof GameTable)) {
            throw new MoveError("gameTable должен быть экземпляром GameTable.");
        }
        return this.#gameTable;
    }

    /**
     * @param {GameTable} value - Экземпляр GameTable.
     * @throws {TypeError} Если переданный объект не является экземпляром GameTable.
     */
    set gameTable(value) {
        if (!(value instanceof GameTable)) {
            throw new TypeError("gameTable должен быть экземпляром GameTable.");
        }
        this.#gameTable = value;
    }

    // Остальной код класса остается без изменений

    getFormattedDateTime() {
        const date = this.dateTime;
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
            players: this.players,
            playersDistances: this.playersDistances,
            gameTable: this.gameTable,
        };
    }

    /**
     * Статический метод для инициализации объекта Move из строки JSON.
     * @param {string} jsonString - Строка JSON, содержащая данные для хода.
     * @returns {Move} Новый объект Move.
     */
    static initFromJSON(inputData) {
        const data = typeof inputData === "string" ? JSON.parse(inputData) : inputData;

        if (
            typeof data?.moveNumber !== "number" ||
            typeof data?.dateTime !== "string" ||
            typeof data?.description !== "string"
        ) {
            throw new Error("Некорректный формат данных в JSON.");
        }

        const players = PlayerCollection.initFromJSON(data.players);
        const move = new Move({
            moveNumber: data.moveNumber,
            description: data.description,
            players: players,
            dateTime: new Date(data.dateTime),
            playersDistances: DistanceHandler.initFromJSON(data.playersDistances, players),
            gameTable: GameTable.initFromJSON(data.gameTable),
        });

        return move;
    }
}

module.exports = Move;
