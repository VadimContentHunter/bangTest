const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const Player = require("../models/Player");

class PlayerCollection {
    constructor() {
        this.players = {};
        this.nextId = 1; // Следующий уникальный идентификатор для нового игрока
    }

    /**
     * Проверяет существование игрока по имени.
     * @param {string} name - Имя игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если имя не является строкой.
     */
    getPlayerByName(name) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой.");
        }
        return Object.values(this.players).find((player) => player.name === name) || null;
    }

    /**
     * Добавляет нового игрока с автоматическим увеличением ID.
     * @param {string} name - Имя игрока.
     * @param {string|null} [sessionId=null] - ID сессии игрока (по умолчанию null).
     * @returns {Player} Добавленный игрок.
     * @throws {ValidatePlayerError} Если игрок с таким именем уже существует или имя не является строкой.
     */
    addPlayer(name, sessionId = null) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой.");
        }

        if (typeof sessionId !== "string" && sessionId !== null) {
            throw new ValidatePlayerError("sessionId должен быть строкой или null.");
        }

        // Проверка на существование игрока
        if (this.getPlayerByName(name) !== null) {
            throw new ValidatePlayerError(`Игрок с именем "${name}" уже существует.`);
        }

        const id = this.nextId++; // Генерация уникального ID для игрока
        const player = new Player(id, name, sessionId); // Создание нового игрока
        this.players[id] = player; // Добавляем игрока в коллекцию по его ID
        console.log(`Добавлен игрок с именем: ${name} и ID: ${id}`);
        return player;
    }

    /**
     * Получает игрока по его ID.
     * @param {number} id - ID игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если ID не является числом.
     */
    getPlayerById(id) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }
        return this.players[id] || null;
    }

    /**
     * Получает игрока по sessionId.
     * @param {string} sessionId - ID сессии игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если sessionId не является строкой.
     */
    getPlayerBySessionId(sessionId) {
        if (typeof sessionId !== "string") {
            throw new ValidatePlayerError("sessionId должен быть строкой.");
        }
        return Object.values(this.players).find((player) => player.sessionId === sessionId) || null;
    }

    /**
     * Обновляет информацию об игроке.
     * @param {number} id - ID игрока.
     * @param {Object} updates - Объект с обновляемыми данными.
     * @throws {ValidatePlayerError} Если игрок не найден или ID не является числом.
     */
    updatePlayer(id, updates) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }

        const player = this.getPlayerById(id);
        if (player) {
            player.update(updates);
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
    }

    /**
     * Удаляет игрока по ID.
     * @param {number} id - ID игрока.
     * @throws {ValidatePlayerError} Если игрок не найден или ID не является числом.
     */
    removePlayer(id) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }

        const player = this.getPlayerById(id);
        if (player) {
            delete this.players[id];
            console.log(`Игрок с ID ${id} удалён.`);
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
    }
}

module.exports = PlayerCollection;
