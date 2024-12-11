const ServerError = require("../Errors/ServerError");
const PlayerCollection = require("../handlers/PlayerCollection");
const Player = require("./Player");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");

class GameSessionHead {
    #statusGame = false;
    #playersDistances = null;

    constructor() {
    }

    /**
     * Получить текущий статус игры.
     * @returns {boolean} Текущий статус игры.
     */
    get statusGame() {
        return this.#statusGame;
    }

    /**
     * Установить статус игры.
     * @param {boolean} status - Новый статус игры.
     * @throws {TypeError} Если передано не булево значение.
     */
    set statusGame(status) {
        if (typeof status !== "boolean") {
            throw new TypeError("statusGame должен быть булевым значением.");
        }
        this.#statusGame = status;
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

    toJSON() {
        return {
            statusGame: this.statusGame,
            playersDistances: this.playersDistances,
        };
    }

    static initFromJSON(json) {
        const gameSessionHeadHandler = new GameSessionHead();
        gameSessionHeadHandler.statusGame = json.statusGame;
        gameSessionHeadHandler.playersDistances = DistanceHandler.initFromJSON(
            json.playersDistances
        );
        return gameSessionHeadHandler;
    }
}

module.exports = GameSessionHead;
