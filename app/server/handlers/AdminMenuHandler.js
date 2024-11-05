const AdminMenuError = require("../Errors/AdminMenuError");
const SessionHandler = require("../handlers/SessionHandler");
const path = require("path");
const { renderTemplate } = require("../services/helper"); // Импортируем необходимые функции

/**
 * Класс AdminMenuHandler
 */
class AdminMenuHandler {
    constructor(sessionId = null, full_access_code = "x;a18") {
        this.sessionId = this.validateSessionId(sessionId);
        this.templatePath = path.join(__dirname, "..", "..", "client", "html");
        this.full_access_code = full_access_code;
    }

    /**
     * Проверяет корректность ID сессии.
     * @param {string} sessionId - ID сессии.
     * @throws {ValidateLoginError} Если sessionId некорректен.
     */
    validateSessionId(sessionId) {
        if (!SessionHandler.getSessionId(sessionId)) {
            throw new AdminMenuError("Session ID is required for Admin Menu.", 1);
        }

        return sessionId;
    }

    /**
     * Проверяет доступ к админке
     * @returns {boolean} Возвращает true, если авторизация прошла успешно.
     * @throws {ValidateLoginError} Если игра не инициализирована.
     */
    hasAccess() {
        const sessionData = SessionHandler.getSessionData(this.sessionId);
        if (
            typeof sessionData.lastCode === "string" &&
            sessionData.lastCode === this.full_access_code
        ) {
            return true;
        }

        return false;
    }

    getAdminMenuTemplate(params = {}) {
        if (this.hasAccess()) {
            return renderTemplate(path.join(this.templatePath, "adminMenu.html"), params);
        }
        return "";
    }
}

module.exports = AdminMenuHandler;
