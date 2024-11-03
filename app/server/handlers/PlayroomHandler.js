const GameHandlerError = require("../Errors/GameHandlerError");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");
const GameSessionHandler = require("./GameSessionHandler");

class PlayroomHandler {
    constructor() {
        this.playerOnline = new PlayerCollection(); // Используем коллекцию игроков
    }

    /**
     * Обрабатывает ошибки, выбрасывая подходящие исключения.
     * @param {Error} error - Ошибка, которую нужно обработать.
     * @throws {GameHandlerError|ValidatePlayerError|ValidateLoginError} Пробрасывает соответствующую ошибку.
     */
    handleError(error) {
        if (error instanceof ValidatePlayerError) {
            throw error;
        } else if (error instanceof ValidateLoginError) {
            throw error;
        } else {
            throw new GameHandlerError(error.message);
        }
    }

    connect(sessionId) {
        const player = this.playerOnline.getPlayerBySessionId(sessionId);
        if (player instanceof Player) {
            console.log(`GameHandler: Игрок подключился:`, player);
            return player;
        }

        // const playerGameSession = this.gameSessionHandler.getPlayerBySessionId(sessionId);
        // if (playerGameSession instanceof Player) {
        //     this.addPlayerOnline(playerGameSession.name, playerGameSession.sessionId);
        //     return player;
        // }

        console.log(`GameHandler: Игрок с сессией "${sessionId}" - не подключен.`);
        return null;
    }

    /**
     * Добавляет игрока в онлайн с заданным именем и sessionId.
     * @param {string} name - Имя игрока.
     * @param {string} sessionId - ID сессии.
     * @throws {GameHandlerError} Если сессия не найдена или игрок с таким именем уже занят другой сессией.
     */
    addPlayerOnline(name, sessionId) {
        try {
            // this.gameSessionHandler.addOrUpdatePlayer(name, sessionId);

            this.playerOnline.addPlayer(name, sessionId); // Добавляем игрока в коллекцию
            console.log(`Игрок ${name} и сессией ${sessionId} добавлен в онлайн.`);
        } catch (error) {
            this.handleError(error);
            return;
        }
    }

    /**
     * Удаляет игрока из онлайна по sessionId.
     * @param {string} sessionId - ID сессии.
     * @throws {GameHandlerError} Если игрок с сессией не найден.
     */
    removePlayerOnlineBySession(sessionId) {
        try {
            if (typeof sessionId !== "string" || sessionId.trim() === "") {
                throw new GameHandlerError("ID сессии должно быть непустой строкой.");
            }

            const player = this.playerOnline.getPlayerBySessionId(sessionId);
            if (!player) {
                throw new GameHandlerError(`Игрок с сессией "${sessionId}" не найден.`);
            }

            this.playerOnline.removePlayerById(player.id); // Удаляем игрока из коллекции
            // SessionHandler.deleteSession(sessionId); // Удаляем сессию
            console.log(`GameHandler: Игрок с сессией ${sessionId} был удален.`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Подсчитывает количество игроков, находящихся онлайн.
     * @returns {number} Количество игроков онлайн.
     */
    countPlayersOnline() {
        return this.playerOnline.countPlayersWithSession();
    }
}

module.exports = PlayroomHandler;