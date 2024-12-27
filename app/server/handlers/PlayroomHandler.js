const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const Player = require("../models/Player");
const PlayerCollection = require("./PlayerCollection/PlayerCollection");
const SessionHandler = require("./SessionHandler");
const GameSessionHandler = require("./GameSessionHandler");
const SessionIdFilter = require("./PlayerCollection/Filters/SessionIdFilter");
const IdFilter = require("./PlayerCollection/Filters/IdFilter");
const BaseFilter = require("./PlayerCollection/Filters/BaseFilter");
// const GameHandler = require("./GameHandler");

class PlayroomHandler {
    #maxPlayers = null;

    constructor(maxPlayers = 7) {
        this.#maxPlayers = maxPlayers;
        this.playerOnline = new PlayerCollection(false);
    }

    get maxPlayers() {
        if (typeof this.#maxPlayers !== "number") {
            throw new PlayroomHandlerError("PlayroomHandler: maxPlayers must be a number");
        }
        return this.#maxPlayers;
    }

    set maxPlayers(maxPlayers) {
        if (typeof maxPlayers !== "number") {
            throw new PlayroomHandlerError("PlayroomHandler: maxPlayers must be a number");
        }
        this.#maxPlayers = maxPlayers;
    }

    /**
     * Обрабатывает ошибки, выбрасывая подходящие исключения.
     * @param {Error} error - Ошибка, которую нужно обработать.
     * @throws {PlayroomHandlerError|ValidatePlayerError|ValidateLoginError} Пробрасывает соответствующую ошибку.
     */
    handleError(error) {
        if (error instanceof ValidatePlayerError) {
            throw error;
        } else if (error instanceof ValidateLoginError) {
            throw error;
        } else {
            throw new PlayroomHandlerError(error.message);
        }
    }

    connect(sessionId) {
        let player = this.playerOnline
            .useFilterClass(SessionIdFilter)
            .getPlayerBySessionId(sessionId);
        if (player instanceof Player) {
            console.log(`PlayroomHandler: Игрок подключился: ${player.name}`);
            return player;
        }

        try {
            const playerFromSession = SessionHandler.getSessionData(sessionId);
            if (
                playerFromSession !== null &&
                typeof playerFromSession.lastName === "string" &&
                playerFromSession.lastName.length > 0
            ) {
                this.addPlayerOnline(playerFromSession.lastName, sessionId);
                player = this.playerOnline
                    .useFilterClass(SessionIdFilter)
                    .getPlayerBySessionId(sessionId);
                if (player instanceof Player) {
                    console.log(
                        `PlayroomHandler: Игрок подключился: ${player.name}, из сохраненной сессии.`
                    );
                    return player;
                }
            }
        } catch (error) {
            this.handleError(error);
            // return;
        }

        // console.log(`PlayroomHandler: Игрок с сессией "${sessionId}" - не подключен.`);
        return null;
    }

    hasOnline(sessionId) {
        let player = this.playerOnline
            .useFilterClass(SessionIdFilter)
            .getPlayerBySessionId(sessionId);
        if (player instanceof Player) {
            return true;
        }

        try {
            const playerFromSession = SessionHandler.getSessionData(sessionId);
            if (
                playerFromSession !== null &&
                typeof playerFromSession.lastName === "string" &&
                playerFromSession.lastName.length > 0
            ) {
                return true;
            }
        } catch (error) {
            this.handleError(error);
        }

        return false;
    }

    /**
     * Добавляет игрока в онлайн с заданным именем и sessionId.
     * @param {string} name - Имя игрока.
     * @param {string} sessionId - ID сессии.
     * @throws {PlayroomHandlerError} Если сессия не найдена или игрок с таким именем уже занят другой сессией.
     */
    addPlayerOnline(name, sessionId) {
        try {
            // this.gameSessionHandler.addOrUpdatePlayer(name, sessionId);
            if (this.playerOnline.countPlayersWithSession() >= this.maxPlayers) {
                throw new PlayroomHandlerError(
                    `Слишком много игроков онлайн. Доступно мест: ${this.maxPlayers}`
                );
            }
            this.playerOnline.addPlayer(name, sessionId); // Добавляем игрока в коллекцию
            // console.log(`Игрок ${name} и сессией ${sessionId} добавлен в онлайн.`);
        } catch (error) {
            this.handleError(error);
            return;
        }
    }

    /**
     * Удаляет игрока из онлайна по sessionId.
     * @param {string} sessionId - ID сессии.
     * @throws {PlayroomHandlerError} Если игрок с сессией не найден.
     */
    removePlayerOnlineBySession(sessionId) {
        try {
            if (typeof sessionId !== "string" || sessionId.trim() === "") {
                throw new PlayroomHandlerError("ID сессии должно быть непустой строкой.");
            }

            const player = this.playerOnline
                .useFilterClass(SessionIdFilter)
                .getPlayerBySessionId(sessionId);
            if (!player) {
                throw new PlayroomHandlerError(`Игрок с сессией "${sessionId}" не найден.`);
            }

            this.playerOnline.removePlayerOrCollection((playerCollection) => {
                return playerCollection instanceof PlayerCollection
                    ? playerCollection.useFilterClass(IdFilter).getPlayerById(player.id)
                    : null;
            }); // Удаляем игрока из коллекции
            // SessionHandler.deleteSession(sessionId); // Удаляем сессию
            // console.log(`PlayroomHandler: Игрок с сессией ${sessionId} был удален.`);
        } catch (error) {
            this.handleError(error);
        }
    }

    getAllPlayersSummaryInfo() {
        return this.playerOnline.useFilterClass(BaseFilter).getDataSummaryAllPlayers();
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
