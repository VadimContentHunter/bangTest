const aResponseHandler = require("../interfaces/aResponseHandler");
const AdminMenuHandler = require("../handlers/AdminMenuHandler");
const StartGameError = require("../Errors/StartGameError");
const GameHandler = require("../handlers/GameHandler");

class StartGame extends aResponseHandler {
    #gameHandler = null;
    constructor(params, gameHandler) {
        super();
        this.gameHandler = gameHandler;
        this.gameHandler.startGame();
    }

    // Геттер для gameHandler
    get gameHandler() {
        if (!(this.#gameHandler instanceof GameHandler)) {
            throw new StartGameError("gameHandler must be a GameHandler for a StartGame");
        }
        return this.#gameHandler;
    }

    // Сеттер для gameHandler
    set gameHandler(newGameHandler) {
        if (!(newGameHandler instanceof GameHandler)) {
            throw new Error("gameHandler must be an instance of GameHandler");
        }
        this.#gameHandler = newGameHandler;
    }

    getResult() {
        return this.#gameHandler.getDistanceHandler();
        // let result = this.adminMenuHandler.getAdminMenuTemplate();
        // return result === "" ? null : result;
    }
}

module.exports = StartGame;
