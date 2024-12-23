const fs = require("fs");
const path = require("path");
const ServerError = require("../Errors/ServerError");
const PlayerCollection = require("../handlers/PlayerCollection");
const Player = require("../models/Player");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const GameSessionHead = require("../models/GameSessionHead");
const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const HistoryHandler = require("../handlers/HistoryHandler");

class GameSessionHandler {
    constructor() {
        this.filePath = null;
        this.head = new GameSessionHead();
        this.history = new HistoryHandler();
    }

    // Генерация пути до файла сессий
    _generatePathToFile() {
        this.filePath = path.join(
            __dirname,
            "..",
            "..",
            "gameSessions",
            `game__${this._getFormattedDateTime()}.json`
        );
    }

    // Форматирование даты и времени
    _getFormattedDateTime() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}_${month}_${year}__${hours}_${minutes}_${seconds}`;
    }

    // Проверка head и history перед сохранением
    _validateSessionData() {
        if (!this._validateHead()) {
            throw new ServerError("Invalid head data");
        }
        if (!this._validateHistory()) {
            throw new ServerError("Invalid history data");
        }
    }

    _validateHead() {
        return this.head instanceof GameSessionHead;
    }

    _validateHistory() {
        return this.history instanceof HistoryHandler;
    }

    createGameSession() {
        if (this.head.statusGame === true) {
            throw new ServerError(
                "GameSessionHandler: Cannot create game session while one already exists."
            );
        }
        this._generatePathToFile();
        this.head.statusGame = true;
        this.saveData();
        console.log(`GameSessionHandler: Game session created. File path: ${this.filePath}`);
    }

    saveData() {
        this._validateSessionData();
        fs.writeFileSync(
            this.filePath,
            JSON.stringify(
                {
                    head: this.head,
                    history: this.history,
                },
                null,
                2
            ),
            "utf8"
        );
        console.log(`GameSessionHandler: Data saved to ${this.filePath}`);
    }

    loadData() {
        if (fs.existsSync(this.filePath)) {
            const fileContent = fs.readFileSync(this.filePath, "utf8");
            const { head, history } = JSON.parse(fileContent);

            if (head && history) {
                this.head = GameSessionHead.initFromJSON(head);
                this.history = HistoryHandler.initFromJSON(history);
                console.log("GameSessionHandler: Data loaded successfully.");
            } else {
                throw new ServerError("GameSessionHandler: Invalid file format.");
            }
        } else {
            console.log("GameSessionHandler: No session file found, starting with empty data.");
        }
    }
}

module.exports = GameSessionHandler;
