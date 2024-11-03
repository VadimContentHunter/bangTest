const GameHandlerError = require("../Errors/GameHandlerError");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");
const GameSessionHandler = require("./GameSessionHandler");

class GameHandler {
    constructor() {
        // this.gameSessionHandler = new GameSessionHandler();
        // this.gameSessionHandler.createGameSession();
    }
}

module.exports = GameHandler;
