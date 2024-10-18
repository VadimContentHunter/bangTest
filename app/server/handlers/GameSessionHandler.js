const fs = require("fs");
const path = require("path");
const ServerError = require("../Errors/ServerError");
const Player = require("../models/Player"); // Предполагается, что класс Player существует в проекте

class GameSessionHandler {
    constructor() {
        this.filePath = null;
        this.head = {};
        this.players = [];
        this.history = [];

        this._generatePathToFile();
        this.loadData(); // Загрузка данных при инициализации
    }

    // Генерация пути до файла сессий
    _generatePathToFile() {
        this.filePath = path.join(
            __dirname,
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

    // Проверка head, players и history перед сохранением
    _validateSessionData() {
        if (!this._validateHead()) {
            throw new ServerError("Invalid head data");
        }
        if (!this._validatePlayers()) {
            throw new ServerError("Invalid players data");
        }
        if (!this._validateHistory()) {
            throw new ServerError("Invalid history data");
        }
    }

    _validateHead() {
        return typeof this.head === "object" && Object.keys(this.head).length > 0;
    }

    _validatePlayers() {
        return Array.isArray(this.players) && this.players.length > 0;
    }

    _validateHistory() {
        return Array.isArray(this.history);
    }

    // Добавление / обновление head
    updateHead(newHead) {
        if (typeof newHead !== "object" || Object.keys(newHead).length === 0) {
            throw new ServerError("Invalid head data");
        }
        this.head = newHead;
        console.log("GameSessionHandler: Head updated.");
    }

    // Добавление игрока
    addPlayer(player) {
        if (!(player instanceof Player)) {
            throw new ServerError("Invalid player data: must be an instance of Player.");
        }
        this.players.push(player);
        console.log(`GameSessionHandler: Player added (ID: ${player.id}).`);
    }

    // Удаление игрока по ID
    removePlayer(playerId) {
        const initialLength = this.players.length;
        this.players = this.players.filter((player) => player.id !== playerId);

        if (this.players.length === initialLength) {
            throw new ServerError(`Player with ID ${playerId} not found.`);
        }
        console.log(`GameSessionHandler: Player removed (ID: ${playerId}).`);
    }

    // Добавление объекта в историю
    addToHistory(event) {
        if (typeof event !== "object" || Object.keys(event).length === 0) {
            throw new ServerError("Invalid history event data.");
        }
        this.history.push(event);
        console.log("GameSessionHandler: Event added to history.");
    }

    saveData() {
        this._validateSessionData();
        fs.writeFileSync(
            this.filePath,
            JSON.stringify(
                {
                    head: this.head,
                    players: this.players,
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
            const { head, players, history } = JSON.parse(fileContent);

            if (head && players && history) {
                this.head = head;
                this.players = players;
                this.history = history;
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
