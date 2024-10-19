const GameHandlerError = require("../Errors/GameHandlerError");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");

class GameHandler {
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

    /**
     * Добавляет игрока в онлайн с заданным именем и sessionId.
     * @param {string} name - Имя игрока.
     * @param {string} sessionId - ID сессии.
     * @throws {GameHandlerError} Если сессия не найдена или игрок с таким именем уже занят другой сессией.
     */
    addPlayerOnline(name, sessionId) {
        try {
            this.playerOnline.addPlayer(name, sessionId); // Добавляем игрока в коллекцию
            console.log(`Игрок ${name} и сессией ${sessionId} добавлен в онлайн.`);

            // Добавляем игрока в сессии
            SessionHandler.addParametersToSession(sessionId, { playerName: name });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Обновляет информацию об игроке в онлайн по имени.
     * @param {string} name - Имя игрока для обновления.
     * @param {Object} updates - Объект с обновляемыми данными.
     * @throws {GameHandlerError} Если игрок не найден или произошла ошибка обновления.
     */
    updatePlayerOnlineByName(name, updates) {
        try {
            if (typeof name !== "string" || name.trim() === "") {
                throw new GameHandlerError("Имя должно быть непустой строкой.");
            }

            this.playerOnline.updatePlayer(name, updates); // Обновляем игрока в коллекции
            console.log(`Игрок ${name} обновлен.`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Обновляет данные сессии по sessionId.
     * @param {string} sessionId - ID сессии.
     * @param {Object} params - Параметры для обновления.
     * @throws {GameHandlerError} Если сессия не найдена.
     */
    updateSessionData(sessionId, params) {
        try {
            if (typeof sessionId !== "string" || sessionId.trim() === "") {
                throw new GameHandlerError("ID сессии должно быть непустой строкой.");
            }

            const sessionData = SessionHandler.getSessionData(sessionId);
            if (!sessionData) {
                throw new GameHandlerError(`Сессия с ID "${sessionId}" не найдена.`);
            }

            SessionHandler.addParametersToSession(sessionId, params); // Обновляем параметры сессии
            console.log(`Данные сессии ${sessionId} обновлены.`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Удаляет игрока из онлайна по имени.
     * @param {string} name - Имя игрока для удаления.
     * @throws {GameHandlerError} Если игрок не найден или произошла ошибка удаления.
     */
    removePlayerOnlineByName(name) {
        try {
            if (typeof name !== "string" || name.trim() === "") {
                throw new GameHandlerError("Имя должно быть непустой строкой.");
            }

            this.playerOnline.removePlayer(name); // Удаляем игрока из коллекции
            console.log(`Игрок ${name} удален из онлайн.`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Удаляет игрока из онлайна по sessionId.
     * @param {string} sessionId - ID сессии.
     * @throws {GameHandlerError} Если игрок с сессией не найден.
     */
    removePlayerBySession(sessionId) {
        try {
            if (typeof sessionId !== "string" || sessionId.trim() === "") {
                throw new GameHandlerError("ID сессии должно быть непустой строкой.");
            }

            const player = this.playerOnline.getPlayerBySessionId(sessionId);
            if (!player) {
                throw new GameHandlerError(`Игрок с сессией "${sessionId}" не найден.`);
            }

            this.playerOnline.removePlayer(player.id); // Удаляем игрока из коллекции
            SessionHandler.deleteSession(sessionId); // Удаляем сессию
            console.log(`Игрок с сессией ${sessionId} был удален.`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Проверяет наличие игрока онлайн по sessionId.
     * @param {string} sessionId - ID сессии для проверки.
     * @returns {Player|null} Игрок, если найден; null, если игрок не найден.
     */
    findPlayerBySession(sessionId) {
        try {
            if (typeof sessionId !== "string" || sessionId.trim() === "") {
                throw new GameHandlerError("ID сессии должно быть непустой строкой.");
            }

            const player = this.playerOnline.getPlayerBySessionId(sessionId);
            if (!player) {
                console.log(`Игрок с сессией "${sessionId}" не найден.`);
                return null; // Игрок не найден
            }
            console.log(`Игрок с сессией "${sessionId}" найден:`, player);
            return player; // Игрок найден
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Подсчитывает количество игроков, находящихся онлайн.
     * @returns {number} Количество игроков онлайн.
     */
    countPlayersOnline() {
        return this.playerOnline.getAllPlayers().filter((player) => player.sessionId !== null)
            .length;
    }

    /**
     * Получает всех игроков, находящихся онлайн.
     * @returns {Player[]} Массив игроков онлайн.
     */
    getOnlinePlayers() {
        return this.playerOnline.getAllPlayers(); // Получаем всех игроков в коллекции
    }
}

module.exports = GameHandler;
