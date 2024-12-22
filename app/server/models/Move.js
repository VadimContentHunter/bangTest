const MoveError = require("../Errors/MoveError");
const PlayerCollection = require("../handlers/PlayerCollection");
const CardsCollection = require("../handlers/CardsCollection");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");

class Move {
    #moveNumber = null;
    #players = null;
    #dateTime = null;
    #description = null;
    #mainDeck = null; // Главная колода
    #discardDeck = null; // Колода сброса
    #playersDistances = null;

    /**
     * Конструктор для модели "Ход".
     * @param {Object} params - Параметры хода.
     * @param {number} params.moveNumber - Номер хода.
     * @param {string} [params.description=""] - Описание хода.
     * @param {PlayerCollection} [params.players=null] - Коллекция игроков после хода.
     * @param {Date} [params.dateTime=null] - Дата и время хода.
     * @param {CardsCollection} [params.mainDeck=null] - Главная колода.
     * @param {CardsCollection} [params.discardDeck=null] - Колода сброса.
     * @param {DistanceHandler} [params.playersDistances=null] - Колода сброса.
     */
    constructor({
        moveNumber = null,
        description = "",
        players = null,
        dateTime = null,
        mainDeck = null,
        discardDeck = null,
        playersDistances = null,
    }) {
        this.moveNumber = moveNumber;
        this.players = players ?? new PlayerCollection();
        this.dateTime = dateTime ?? new Date();
        this.description = description;
        this.mainDeck = mainDeck ?? new CardsCollection();
        this.discardDeck = discardDeck ?? new CardsCollection();
        this.playersDistances = playersDistances ?? new DistanceHandler();
    }

    /**
     * Получить текущий экземпляр DistanceHandler.
     * @returns {DistanceHandler|null} Текущий DistanceHandler или null, если не установлен.
     */
    get playersDistances() {
        return this.#playersDistances;
    }

    /**
     * Установить экземпляр DistanceHandler.
     * @param {DistanceHandler} distanceHandler - Новый экземпляр DistanceHandler.
     * @throws {TypeError} Если переданный объект не является экземпляром DistanceHandler.
     */
    set playersDistances(distanceHandler) {
        if (!(distanceHandler instanceof DistanceHandler)) {
            throw new TypeError("playersDistances должен быть экземпляром DistanceHandler.");
        }
        this.#playersDistances = distanceHandler;
    }

    // Геттер и сеттер для номера хода
    get moveNumber() {
        if (
            this.#moveNumber !== null &&
            (typeof this.#moveNumber !== "number" || this.#moveNumber <= 0)
        ) {
            throw new MoveError("Номер хода должен быть положительным числом или null.");
        }
        return this.#moveNumber;
    }

    set moveNumber(value) {
        if (value !== null && (typeof value !== "number" || value <= 0)) {
            throw new MoveError("Номер хода должен быть положительным числом  или null.");
        }
        this.#moveNumber = value;
    }

    // Геттер и сеттер для игроков после хода
    get players() {
        if (!(this.#players instanceof PlayerCollection)) {
            throw new MoveError("players должен быть экземпляром PlayerCollection.");
        }
        return this.#players;
    }

    set players(value) {
        if (!(value instanceof PlayerCollection)) {
            throw new MoveError("players должен быть экземпляром PlayerCollection.");
        }
        this.#players = value;
    }

    // Геттер и сеттер для даты и времени
    get dateTime() {
        if (!(this.#dateTime instanceof Date)) {
            throw new MoveError("dateTime должен быть экземпляром Date.");
        }
        return this.#dateTime;
    }

    set dateTime(value) {
        if (!(value instanceof Date)) {
            throw new MoveError("dateTime должен быть экземпляром Date.");
        }
        this.#dateTime = value;
    }

    // Геттер и сеттер для описания хода
    get description() {
        if (typeof this.#description !== "string") {
            throw new MoveError("description должно быть строкой.");
        }
        return this.#description;
    }

    set description(value) {
        if (typeof value !== "string") {
            throw new MoveError("description должно быть строкой.");
        }
        this.#description = value;
    }

    // Геттер и сеттер для главной колоды
    get mainDeck() {
        if (!(this.#mainDeck instanceof CardsCollection)) {
            throw new MoveError("mainDeck должен быть экземпляром CardsCollection.");
        }
        return this.#mainDeck;
    }

    set mainDeck(value) {
        if (!(value instanceof CardsCollection)) {
            throw new MoveError("mainDeck должен быть экземпляром CardsCollection.");
        }
        this.#mainDeck = value;
    }

    // Геттер и сеттер для колоды сброса
    get discardDeck() {
        if (!(this.#discardDeck instanceof CardsCollection)) {
            throw new MoveError("discardDeck должен быть экземпляром CardsCollection.");
        }
        return this.#discardDeck;
    }

    set discardDeck(value) {
        if (!(value instanceof CardsCollection)) {
            throw new MoveError("discardDeck должен быть экземпляром CardsCollection.");
        }
        this.#discardDeck = value;
    }

    getFormattedDateTime() {
        const date = this.#dateTime;
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
            mainDeck: this.mainDeck,
            discardDeck: this.discardDeck,
            playersDistances: this.playersDistances,
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
                // !Array,isArray(data.players) ||
                typeof data.dateTime !== "string" ||
                typeof data.description !== "string"
                // !Array,isArray(data.mainDeck) ||
                // !Array,isArray(data.discardDeck) ||
                // !Array,isArray(data.playersDistances) ||
            ) {
                throw new Error("Некорректный формат данных в JSON.");
            }

            const players = PlayerCollection.initFromJSON(data.players);
            // Создаем объект Move и инициализируем его данными из JSON
            const move = new Move({
                moveNumber: data.moveNumber,
                description: data.description,
                players: players,
                dateTime: new Date(data.dateTime),
                mainDeck: CardsCollection.initFromJSON(data.mainDeck, false),
                discardDeck: CardsCollection.initFromJSON(data.discardDeck, false),
                playersDistances: DistanceHandler.initFromJSON(data.playersDistances, players),
            });

            return move;
        } catch (error) {
            throw new Error("Ошибка при инициализации Move из JSON: " + error.message);
        }
    }
}

module.exports = Move;
