const GameHandlerError = require("../Errors/GameHandlerError");
const EventEmitter = require("events");
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
const GameTableError = require("../Errors/GameTableError");
const GameTable = require("../models/GameTable");
const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const HistoryHandler = require("../handlers/HistoryHandler");
const MoveError = require("../Errors/MoveError");
const Move = require("../models/Move");

class GameHandler extends EventEmitter {
    constructor(playroomHandler) {
        super();
        if (!(playroomHandler instanceof PlayroomHandler)) {
            throw new Error("playroomHandler must be an instance of PlayroomHandler");
        }
        this.playroomHandler = playroomHandler;
        this.gameSessionHandler = new GameSessionHandler();
        this.gameTable = new GameTable();
        this.distanceHandler = new DistanceHandler();
        this.historyHandler = new HistoryHandler();
    }

    getDistanceHandler() {
        return this.gameSessionHandler?.head?.playersDistances;
    }

    startGame() {
        this.gameSessionHandler.createGameSession();
        this.distanceHandler.setDistancesForPlayers(this.playroomHandler.playerOnline.getPlayers());
        this.saveForGameSession();
        // this.gameSessionHandler.players.setPlayersWithNewIds(
        //     this.playroomHandler.playerOnline.getPlayers()
        // );

        // this.distanceHandler.setDistancesForPlayers(this.playroomHandler.playerOnline.getPlayers());
        // this.gameSessionHandler.head.playersDistances = this.distanceHandler;
    }

    saveForGameSession() {
        this.gameSessionHandler.loadData();
        this.gameSessionHandler.addMoveData({
            playersDistances: this.distanceHandler,
            players: [],
            // players: this.playroomHandler.playerOnline.getPlayers(),
            history: {}
        });

        this.gameSessionHandler.saveData();
    }
}

module.exports = GameHandler;
