const ServerError = require("../Errors/ServerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const SessionHandler = require("../handlers/SessionHandler");

/**
 * Класс AuthHandler обрабатывает аутентификацию и авторизацию пользователей.
 */
class AuthHandler {
    static _playroomHandler = null;

    /**
     * Создает экземпляр AuthHandler.
     * @param {string|null} name - Имя пользователя.
     * @param {string|null} sessionId - ID сессии пользователя.
     */
    constructor(name = null, code = null, sessionId = null) {
        this.name = name;
        this.code = code;
        this.sessionId = sessionId;
    }

    static set playroomHandler(value) {
        if (!(value instanceof PlayroomHandler)) {
            throw new ValidateLoginError("Игра не инициализирована.");
        }
        AuthHandler._playroomHandler = value;
    }

    static get playroomHandler() {
        return AuthHandler._playroomHandler;
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
        if (!AuthHandler.playroomHandler) {
            throw new ServerError("Игра не инициализирована.");
        }
        
        SessionHandler.addParametersToSession(this.sessionId, {
            lastName: this.name,
            lastCode: this.code,
        });
        AuthHandler.playroomHandler.connect(this.sessionId);

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
