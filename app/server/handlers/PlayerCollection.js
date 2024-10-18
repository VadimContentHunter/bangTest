const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const Player = require("../models/Player");

class PlayerCollection {
    constructor() {
        this.players = {};
        this.nextId = 1; // Следующий уникальный идентификатор для нового игрока
    }

    // Проверка на существующего игрока по имени
    getPlayerByName(name) {
        return Object.values(this.players).find((player) => player.name === name) || null;
    }

    // Добавление нового игрока с автоматическим увеличением ID
    addPlayer(name, sessionId = null) {
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

    getPlayerById(id) {
        return this.players[id] || null;
    }

    getPlayerByName(name) {
        return Object.values(this.players).find((player) => player.name === name) || null;
    }

    getPlayerBySessionId(sessionId) {
        return Object.values(this.players).find((player) => player.sessionId === sessionId) || null;
    }

    updatePlayer(id, updates) {
        const player = this.getPlayerById(id);
        if (player) {
            player.update(updates);
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
    }

    removePlayer(id) {
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
