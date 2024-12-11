const GameHandlerError = require("../Errors/GameHandlerError");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");
const GameSessionHandler = require("./GameSessionHandler");
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");

class GameHandler {
    constructor(playroomHandler) {
        if (!(playroomHandler instanceof PlayroomHandler)) {
            throw new Error("playroomHandler must be an instance of PlayroomHandler");
        }
        this.playroomHandler = playroomHandler;
        this.gameSessionHandler = new GameSessionHandler();
        // this.gameSessionHandler.createGameSession();
    }

    getDistanceHandler() {
        return this.gameSessionHandler?.head?.playersDistances;
    }

    startGame() {
        this.gameSessionHandler.createGameSession();

        this.playroomHandler.playerOnline.getPlayers().forEach((playerOnline, index) => {
            this.gameSessionHandler.addOrUpdatePlayer(playerOnline.name, playerOnline.sessionId);
        });

        this.gameSessionHandler.setDistancesForPlayers(
            this.playroomHandler.playerOnline.getPlayers()
        );
    }
}

module.exports = GameHandler;
