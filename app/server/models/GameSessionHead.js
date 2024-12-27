const ServerError = require("../Errors/ServerError");
const PlayerCollection = require("../handlers/PlayerCollection/PlayerCollection");
const Player = require("./Player");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");

class GameSessionHead {
    #statusGame = false;

    constructor() {}

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

    toJSON() {
        return {
            statusGame: this.statusGame,
        };
    }

    static initFromJSON(json) {
        const gameSessionHeadHandler = new GameSessionHead();
        gameSessionHeadHandler.statusGame = json.statusGame;
        return gameSessionHeadHandler;
    }
}

module.exports = GameSessionHead;
