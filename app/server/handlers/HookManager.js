class HookManager {
    constructor() {
        this.hooks = new Map(); // { playerId: { hookName, data } }
    }

    /**
     * Сохраняет хук для конкретного игрока.
     * @param {string} playerId - Уникальный идентификатор игрока.
     * @param {string} hookName - Название хука.
     * @param {Object} data - Данные, связанные с хуком.
     */
    saveHook(playerId, hookName, data) {
        this.hooks.set(playerId, { hookName, data });
    }

    /**
     * Получает последний сохранённый хук для игрока.
     * @param {string} playerId - Уникальный идентификатор игрока.
     * @returns {Object|null} Данные хука или null, если нет сохранённых данных.
     */
    getHook(playerId) {
        return this.hooks.get(playerId) || null;
    }

    /**
     * Удаляет сохранённый хук для игрока.
     * @param {string} playerId - Уникальный идентификатор игрока.
     */
    removeHook(playerId) {
        this.hooks.delete(playerId);
    }
}

module.exports = HookManager;
