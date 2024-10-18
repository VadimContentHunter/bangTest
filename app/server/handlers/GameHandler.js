const GameHandlerError = require("../Errors/GameHandlerError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection");
const SessionHandler = require("./SessionHandler");

class GameHandler {
    constructor() {
        this.playerOnline = new PlayerCollection(); // Используем коллекцию игроков
    }

    /**
     * Добавляет игрока в онлайн с заданным именем и sessionId.
     * @param {string} name - Имя игрока.
     * @param {string} sessionId - ID сессии.
     * @throws {GameHandlerError} Если сессия не найдена или игрок с таким именем уже занят другой сессией.
     */
    addPlayerOnline(name, sessionId) {
        try {
            // Проверка существования сессии
            if (!SessionHandler.getSessionId(sessionId)) {
                throw new GameHandlerError(`Сессия с ID "${sessionId}" не найдена.`);
            }

            // Проверка, существует ли игрок с таким именем и активной сессией
            const existingPlayer = this.playerOnline.getPlayerByName(name);
            if (existingPlayer && existingPlayer.sessionId === sessionId) {
                throw new GameHandlerError(
                    `Игрок с именем "${name}" уже занят сессией "${sessionId}".`
                );
            } else if (existingPlayer) {
                throw new GameHandlerError(`Игрок с именем "${name}" уже занят другой сессией.`);
            }

            // Создаем нового игрока и добавляем его в коллекцию
            const player = new Player(name, sessionId); // Создаем игрока с sessionId
            this.playerOnline.addPlayer(player); // Добавляем игрока в коллекцию

            console.log(
                `Игрок ${name} добавлен в онлайн с ID ${player.id} и сессией ${sessionId}.`
            );

            // Добавляем игрока в сессии
            SessionHandler.addParametersToSession(sessionId, { playerId: player.id });
        } catch (error) {
            throw new GameHandlerError(error.message);
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
            this.playerOnline.updatePlayer(name, updates); // Обновляем игрока в коллекции
            console.log(`Игрок ${name} обновлен.`);
        } catch (error) {
            throw new GameHandlerError(error.message);
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
            const sessionData = SessionHandler.getSessionData(sessionId);
            if (!sessionData) {
                throw new GameHandlerError(`Сессия с ID "${sessionId}" не найдена.`);
            }

            SessionHandler.addParametersToSession(sessionId, params); // Обновляем параметры сессии
            console.log(`Данные сессии ${sessionId} обновлены.`);
        } catch (error) {
            throw new GameHandlerError(error.message);
        }
    }

    /**
     * Удаляет игрока из онлайна по имени.
     * @param {string} name - Имя игрока для удаления.
     * @throws {GameHandlerError} Если игрок не найден или произошла ошибка удаления.
     */
    removePlayerOnlineByName(name) {
        try {
            this.playerOnline.removePlayer(name); // Удаляем игрока из коллекции
            console.log(`Игрок ${name} удален из онлайн.`);
        } catch (error) {
            throw new GameHandlerError(error.message);
        }
    }

    /**
     * Удаляет игрока из онлайна по sessionId.
     * @param {string} sessionId - ID сессии.
     * @throws {GameHandlerError} Если игрок с сессией не найден.
     */
    removePlayerBySession(sessionId) {
        try {
            const player = this.playerOnline.getPlayerBySessionId(sessionId);
            if (!player) {
                throw new GameHandlerError(`Игрок с сессией "${sessionId}" не найден.`);
            }

            this.playerOnline.removePlayer(player.id); // Удаляем игрока из коллекции
            SessionHandler.deleteSession(sessionId); // Удаляем сессию
            console.log(`Игрок с сессией ${sessionId} был удален.`);
        } catch (error) {
            throw new GameHandlerError(error.message);
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
