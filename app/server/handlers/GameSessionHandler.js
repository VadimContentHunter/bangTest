const fs = require("fs");
const path = require("path");
const ServerError = require("../Errors/ServerError");
const PlayerCollection = require("../handlers/PlayerCollection");
const Player = require("../models/Player");

class GameSessionHandler {
    constructor() {
        this.filePath = null;
        this.head = { statusGame: false }; // Добавляем статус игры по умолчанию false
        this.players = new PlayerCollection(); // Заменяем массив на коллекцию PlayerCollection
        this.history = [];
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
        // return this.players.countAllPlayers() > 0; // Используем метод countAllPlayers из PlayerCollection
        return true;
    }

    _validateHistory() {
        return Array.isArray(this.history);
    }

    // Добавление игрока через PlayerCollection
    addPlayer(name, sessionId) {
        this.loadData();
        this.players.addPlayer(name, sessionId);
        this.saveData(); // Сохранение данных после добавления игрока
        console.log(`GameSessionHandler: Player added (Name: ${name}). Data saved.`);
    }

    updatePlayerByName(name, sessionId) {
        this.loadData();
        this.players.updatePlayerByName(name, sessionId);
        this.saveData(); // Сохранение данных после добавления игрока
        console.log(`GameSessionHandler: Player added (Name: ${name}). Data saved.`);
    }

    /**
     * Добавляет игрока или обновляет сессию существующего игрока по имени.
     * @param {string} name - Имя игрока.
     * @param {string} sessionId - ID сессии игрока.
     */
    addOrUpdatePlayer(name, sessionId) {
        if (this.getPlayerByName(name) instanceof Player) {
            // Если игрок существует, обновляем его sessionId
            this.updatePlayerByName(name, sessionId);
            console.log(`GameSessionHandler: Updated session ID for player (Name: ${name}).`);
        } else {
            // Если игрока нет, добавляем нового
            this.addPlayer(name, sessionId);
            console.log(`GameSessionHandler: Added new player (Name: ${name}).`);
        }
    }

    getPlayerByName(name) {
        this.loadData(); // Загрузка данных перед поиском игрока
        const player = this.players.getPlayerByName(name);
        if (!(player instanceof Player)) {
            return null;
        }
        return player;
    }

    // Удаление игрока через PlayerCollection
    removePlayer(playerId) {
        this.loadData();
        this.players.removePlayerById(playerId);
        this.saveData();
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

    // Метод для установки статуса игры
    setStatusGame(status) {
        if (typeof status !== "boolean") {
            throw new ServerError("statusGame must be a boolean value.");
        }
        this.head.statusGame = status;
        this.saveData();
        console.log(`GameSessionHandler: Game status set to ${status}.`);
    }

    // Метод для получения статуса игры
    getStatusGame() {
        this.loadData();
        return this.head.statusGame;
    }

    createGameSession() {
        if (this.getStatusGame() === true) {
            throw new ServerError(
                "GameSessionHandler: Cannot create game session while one already exists."
            );
        }
        this._generatePathToFile();
        this.setStatusGame(true);
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
                    players: this.players.getPlayers(), // Получаем массив игроков из коллекции
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
                this.players.removeAllPlayers();
                players.forEach((player) => {
                    this.players.addPlayer(player?.name, player?.sessionId); // Восстанавливаем игроков
                });
                // console.log(`loadData ${this.players}`);
                
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
