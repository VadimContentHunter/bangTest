const fs = require("fs");
const path = require("path");
const ServerError = require("../Errors/ServerError");
const crypto = require("crypto");
const { parseCookies } = require("../services/helper");

/**
 * Класс для управления сессиями.
 */
class SessionHandler {
    static sessions = {};
    static filePath = path.join(__dirname, "..", "..", "sessions.json");
    static sessionLifetime = 3600;

    /**
     * Загружает сессии из файла.
     */
    static loadSessions() {
        if (fs.existsSync(this.filePath)) {
            const fileContent = fs.readFileSync(this.filePath, "utf8");
            this.sessions = JSON.parse(fileContent);
            // console.log(`SessionHandler: Loaded sessions: ${Object.keys(this.sessions).length}`);
        } else {
            console.log("SessionHandler: No session file found. Starting with empty sessions.");
        }
    }

    /**
     * Сохраняет сессии в файл.
     */
    static saveSessions() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.sessions, null, 2), "utf8");
        // console.log(`SessionHandler: Saved sessions: ${Object.keys(this.sessions).length}`);
    }

    /**
     * Генерирует уникальный ID сессии.
     * @returns {string} Уникальный ID сессии.
     */
    static generateSessionId() {
        return crypto.randomBytes(16).toString("hex");
    }

    /**
     * Создает новую сессию с параметрами.
     * @param {Object} params - Параметры сессии.
     * @returns {string} ID созданной сессии.
     */
    static createSession(params = {}) {
        let sessionId;
        do {
            sessionId = this.generateSessionId();
        } while (this.sessions[sessionId]);

        const now = Date.now();
        const createdAtFormatted = new Date(now).toLocaleString();

        this.sessions[sessionId] = {
            ...params,
            createdAt: now,
            createdAtFormatted,
        };
        this.saveSessions();

        // console.log(`SessionHandler: Created session: ${sessionId}, at ${createdAtFormatted}`);
        return sessionId;
    }

    /**
     * Проверяет, истекло ли время жизни сессии.
     * @param {string} sessionId - ID сессии.
     * @returns {boolean} True, если сессия истекла; иначе false.
     */
    static isSessionExpired(sessionId) {
        const sessionData = this.getSessionData(sessionId);
        if (sessionData && sessionData.createdAt) {
            const now = Date.now();
            const createdAt = sessionData.createdAt;

            const expired = now - createdAt >= this.sessionLifetime * 1000;
            if (expired) {
                // console.log(`SessionHandler: Session expired: ${sessionId}`);
            }
            return expired;
        }
        return false;
    }

    /**
     * Обновляет ID сессии.
     * @param {string} sessionId - ID сессии.
     * @returns {string|null} Новый ID сессии или null, если не найдена.
     */
    static refreshSession(sessionId) {
        const sessionData = this.getSessionData(sessionId);
        if (sessionData) {
            this.deleteSession(sessionId);
            const newSessionId = this.createSession(sessionData);
            // console.log(`SessionHandler: Refreshed session: ${sessionId} -> ${newSessionId}`);
            return newSessionId;
        }
        console.log(`SessionHandler: Session not found for refresh: ${sessionId}`);
        return null;
    }

    /**
     * Получает ID сессии по ID.
     * @param {string} sessionId - ID сессии.
     * @returns {string|null} ID сессии или null, если не найдена.
     */
    static getSessionId(sessionId) {
        return this.sessions[sessionId] ? sessionId : null;
    }

    /**
     * Получает данные сессии по ID.
     * @param {string} sessionId - ID сессии.
     * @returns {Object|null} Данные сессии или null, если не найдена.
     */
    static getSessionData(sessionId) {
        return this.sessions[sessionId] || null;
    }

    /**
     * Получает информацию о сессии (ID и данные).
     * @param {string} sessionId - ID сессии.
     * @returns {Object|null} Информация о сессии или null, если не найдена.
     */
    static getSessionInfo(sessionId) {
        const sessionData = this.sessions[sessionId];
        return sessionData ? { sessionId, ...sessionData } : null;
    }

    /**
     * Удаляет сессию.
     * @param {string} sessionId - ID сессии.
     */
    static deleteSession(sessionId) {
        if (this.sessions[sessionId]) {
            delete this.sessions[sessionId];
            this.saveSessions();
            // console.log(`SessionHandler: Deleted session: ${sessionId}`);
        } else {
            console.log(`SessionHandler: Session not found for deletion: ${sessionId}`);
        }
    }

    /**
     * Получает ID сессии из куков.
     * @param {string} cookieHeader - Заголовок куков.
     * @returns {string|null} ID сессии или null, если не найден.
     */
    static getSessionIdFromCookies(cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        return cookies.sessionId || null;
    }

    /**
     * Получает или создает ID сессии.
     * @param {string} cookie - Куки.
     * @returns {string} ID сессии.
     */
    static getCreateSessionId(cookie) {
        const sessionId = this.getSessionIdFromCookies(cookie);

        if (sessionId && this.getSessionId(sessionId)) {
            if (this.isSessionExpired(sessionId)) {
                return this.refreshSession(sessionId);
            }
            // console.log(`SessionHandler: Using existing session: ${sessionId}`);
            return sessionId;
        }

        const newSessionId = this.createSession();
        // console.log(`SessionHandler: Created new session: ${newSessionId}`);
        return newSessionId;
    }

    /**
     * Добавляет параметры к указанной сессии.
     * @param {string} sessionId - ID сессии.
     * @param {Object} params - Параметры для добавления.
     * @throws {ServerError} Если сессия не найдена.
     */
    static addParametersToSession(sessionId, params) {
        const session = this.getSessionData(sessionId);
        if (session) {
            if (this.isSessionExpired(sessionId)) {
                this.deleteSession(sessionId);
                sessionId = this.createSession(session);
                // console.log(`SessionHandler: Session expired and recreated: ${sessionId}`);
            }

            Object.assign(this.sessions[sessionId], params);
            this.saveSessions();
            // console.log(
            //     `SessionHandler: Updated session: ${sessionId} with params: ${JSON.stringify(
            //         params
            //     )}`
            // );
        } else {
            throw new ServerError("Session not found");
        }
    }

    /**
     * Обновляет данные сессии, не затрагивая указанные поля.
     * @param {string} sessionId - ID сессии.
     * @param {Object} newData - Новые данные для обновления.
     * @param {Array<string>} preserveFields - Список полей, которые не должны изменяться.
     * @throws {ServerError} Если сессия не найдена.
     */
    static setParametersToSession(sessionId, newData, preserveFields = []) {
        const session = this.getSessionData(sessionId);
        if (session) {
            if (this.isSessionExpired(sessionId)) {
                this.deleteSession(sessionId);
                sessionId = this.createSession(newData);
                // console.log(`SessionHandler: Session expired and recreated: ${sessionId}`);
            } else {
                // Копируем только те поля из старых данных, которые указаны в preserveFields
                const preservedData = {};
                preserveFields.forEach((field) => {
                    if (field in session) {
                        preservedData[field] = session[field];
                    }
                });

                // Объединяем сохраненные поля с новыми данными
                this.sessions[sessionId] = { ...newData, ...preservedData };
                this.saveSessions();
                console.log(
                    // `SessionHandler: Updated session: ${sessionId} with new data, preserving fields: ${preserveFields}`
                );
            }
        } else {
            throw new ServerError("Session not found");
        }
    }
}

module.exports = SessionHandler;
