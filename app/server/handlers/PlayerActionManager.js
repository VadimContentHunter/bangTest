class PlayerActionManager {
    constructor() {
        this.hooks = new Map(); // Map to store hooks associated with player names
    }

    /**
     * Resolves the player's name from a string or a Player object.
     * @param {string|object} player - Player name or Player object with a name property.
     * @returns {string} - The resolved player name.
     */
    resolveName(player) {
        return typeof player === "object" && player.name ? player.name : player;
    }

    /**
     * Validates a hook object.
     * @param {object} hook - Hook object to validate.
     * @param {string} hook.name - Name of the hook.
     * @param {*} hook.data - Data associated with the hook.
     * @throws {Error} - If the hook is invalid.
     */
    validateHook(hook) {
        if (typeof hook !== "object" || !hook.name || typeof hook.name !== "string") {
            throw new Error("Invalid hook: missing or invalid 'name' property.");
        }
        if (!("data" in hook)) {
            throw new Error("Invalid hook: missing 'data' property.");
        }
    }

    /**
     * Adds a hook for a specific player.
     * @param {string|object} player - Player name or Player object.
     * @param {object} hook - Hook object with 'name' and 'data' properties.
     * @param {string} hook.name - Name of the hook.
     * @param {*} hook.data - Data associated with the hook.
     */
    addHook(player, hook) {
        this.validateHook(hook);
        const name = this.resolveName(player);
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name).push(hook);
    }

    /**
     * Sets hooks for a specific player, replacing any existing hooks.
     * @param {string|object} player - Player name or Player object.
     * @param {Array<object>} hooks - Array of hooks to set.
     * @param {string} hooks[].name - Name of each hook.
     * @param {*} hooks[].data - Data associated with each hook.
     * @throws {Error} - If hooks are not an array or contain invalid hook objects.
     */
    setHooks(player, hooks) {
        if (!Array.isArray(hooks)) {
            throw new Error("Hooks must be an array.");
        }
        hooks.forEach(this.validateHook);
        const name = this.resolveName(player);
        this.hooks.set(name, hooks);
    }

    /**
     * Retrieves all hooks associated with a specific player.
     * @param {string|object} player - Player name or Player object.
     * @returns {Array<object>} - Array of hooks associated with the player.
     */
    getHooksByPlayer(player) {
        const name = this.resolveName(player);
        return this.hooks.get(name) || [];
    }

    /**
     * Retrieves the last hook for a specific player.
     * @param {string|object} player - Player name or Player object.
     * @returns {object|null} - The last hook associated with the player, or null if no hooks exist.
     */
    getLastHook(player) {
        const name = this.resolveName(player);
        const hooks = this.hooks.get(name);
        return hooks && hooks.length > 0 ? hooks[hooks.length - 1] : null;
    }

    /**
     * Retrieves all hooks for all players as an array.
     * @returns {Array<object>} - Array of all hooks associated with all players.
     */
    getAllHooks() {
        const allHooks = [];
        for (const [player, hooks] of this.hooks.entries()) {
            allHooks.push({ player, hooks });
        }
        return allHooks;
    }

    /**
     * Находит хук по имени для конкретного игрока.
     * @param {string|object} player - Имя игрока или объект Player.
     * @param {string} hookName - Имя хука для поиска.
     * @returns {object|null} - Найденный хук или null, если хук не найден.
     */
    findHookByName(player, hookName) {
        const name = this.resolveName(player);
        const hooks = this.hooks.get(name) || [];
        return hooks.find((hook) => hook.name === hookName) || null;
    }

    /**
     * Clears all hooks for all players.
     */
    clearAll() {
        this.hooks.clear();
    }

    /**
     * Clears hooks for a specific player.
     * @param {string|object} player - Player name or Player object.
     */
    clearHooksByPlayer(player) {
        const name = this.resolveName(player);
        this.hooks.delete(name);
    }

    /**
     * Extracts the name of a hook after validation.
     * @param {object} hook - Hook object.
     * @returns {string} - The name of the hook.
     * @throws {Error} - If the hook object is invalid.
     */
    static getHookName(hook) {
        if (typeof hook !== "object" || !hook.name || typeof hook.name !== "string") {
            throw new Error("Invalid hook: missing or invalid 'name' property.");
        }
        return hook.name;
    }

    /**
     * Extracts the data of a hook after validation.
     * @param {object} hook - Hook object.
     * @returns {*} - The data of the hook.
     * @throws {Error} - If the hook object is invalid.
     */
    static getHookData(hook) {
        if (typeof hook !== "object" || !("data" in hook)) {
            throw new Error("Invalid hook: missing 'data' property.");
        }
        return hook.data;
    }
}

module.exports = PlayerActionManager;
