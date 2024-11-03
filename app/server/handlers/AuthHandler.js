const ServerError = require("../Errors/ServerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const GameHandler = require("../handlers/GameHandler");
const SessionHandler = require("../handlers/SessionHandler");

/**
 * Класс AuthHandler обрабатывает аутентификацию и авторизацию пользователей.
 */
class AuthHandler {
    /**
     * Создает экземпляр AuthHandler.
     * @param {string|null} name - Имя пользователя.
     * @param {string|null} sessionId - ID сессии пользователя.
     * @param {GameHandler|null} gameHandler - Обработчик игры.
     */
    constructor(name = null, sessionId = null, gameHandler = null) {
        this.name = name;
        this.sessionId = sessionId;
        this.gameHandler = gameHandler;
    }

    /**
     * Проверяет подлинность личности пользователя.
     * @returns {boolean} Возвращает true, если аутентификация прошла успешно.
     * @throws {ValidateLoginError} Если имя или sessionId некорректны.
     */
    Authentication() {
        this.validateName(this.name);
        this.validateSessionId(this.sessionId);
        return true;
    }

    /**
     * Предоставляет пользователю права.
     * @returns {boolean} Возвращает true, если авторизация прошла успешно.
     * @throws {ValidateLoginError} Если игра не инициализирована.
     */
    Authorization() {
        if (!(this.gameHandler instanceof GameHandler)) {
            throw new ValidateLoginError("Игра не была инициализирована.", 500);
        }

        this.gameHandler.addPlayerOnline(this.name, this.sessionId);
        SessionHandler.addParametersToSession(this.sessionId, { lastName: this.name });
        return true;
    }

    /**
     * Проверяет имя пользователя.
     * @param {string} name - Имя пользователя.
     * @throws {ValidateLoginError} Если имя некорректно.
     */
    validateName(name) {
        if (typeof name !== "string" || name.length <= 4 || !/^[A-Za-z]+$/.test(name)) {
            throw new ValidateLoginError(
                "Имя должно быть строкой, содержать более 4 символов и только латинские буквы (A-Z, a-z).",
                1
            );
        }
    }

    /**
     * Проверяет корректность ID сессии.
     * @param {string} sessionId - ID сессии.
     * @throws {ValidateLoginError} Если sessionId некорректен.
     */
    validateSessionId(sessionId) {
        if (!SessionHandler.getSessionId(sessionId)) {
            throw new ValidateLoginError("Session ID is required for login.", 1);
        }
    }
}

module.exports = AuthHandler;
