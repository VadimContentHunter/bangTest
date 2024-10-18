const fs = require("fs");
const path = require("path");
const ValidatePlayerError = require("../Errors/ValidatePlayerError");

class Player {
    static filePath = path.join(__dirname, "..", "..", "players.json");
    static players = {};
    static playersId = 0;

    constructor(name, sessionId = null) {
        this.validateName(name); // Валидация имени при создании
        Player.checkIfNameExists(name); // Проверка на существование имени

        this.id = ++Player.playersId;
        this.name = name;
        this.sessionId = sessionId;
    }

    validateName(name) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой", 1);
        }

        if (name.length <= 4) {
            throw new ValidatePlayerError("Имя должно содержать более 4 символов", 1);
        }

        const regex = /^[A-Za-z]+$/;
        if (!regex.test(name)) {
            throw new ValidatePlayerError(
                "Имя может содержать только латинские буквы (A-Z, a-z)",
                1
            );
        }
    }

    setSession(sessionId) {
        if (typeof sessionId !== "string" || sessionId.length === 0) {
            throw new ValidatePlayerError("Некорректный идентификатор сессии", 2);
        }
        this.sessionId = sessionId;
        Player.savePlayers(); // Сохраняем обновленные данные после изменения
        console.log(`Игроку ${this.name} присвоена сессия: ${sessionId}`);
    }

    getInfo() {
        return {
            id: this.id,
            name: this.name,
            sessionId: this.sessionId,
        };
    }

    update(updates) {
        Object.assign(this, updates);
        Player.savePlayers();
        console.log(`Данные игрока ${this.name} обновлены.`);
    }

    remove() {
        Player.removePlayer(this.name);
        console.log(`Игрок ${this.name} удалён.`);
    }

    // === Статические методы ===

    static loadPlayers() {
        if (fs.existsSync(this.filePath)) {
            this.players = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
            console.log(`Загружено игроков: ${Object.keys(this.players).length}`);
        } else {
            console.log("Файл с игроками не найден. Начинаем с пустого списка.");
        }
    }

    static savePlayers() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.players, null, 2), "utf8");
        console.log(`Сохранено игроков: ${Object.keys(this.players).length}`);
    }

    static checkIfNameExists(name) {
        if (Player.getPlayerByName(name)) {
            throw new ValidatePlayerError(`Игрок с именем "${name}" уже существует`, 1);
        }
    }

    static getPlayerByName(name) {
        return this.players[name] || null;
    }

    static getPlayerBySessionId(sessionId) {
        return Object.values(this.players).find((player) => player.sessionId === sessionId) || null;
    }

    // Получаем игрока по ID
    static getPlayerById(id) {
        return Object.values(this.players).find((player) => player.id === id) || null;
    }

    static addPlayer(player) {
        if (!(player instanceof Player)) {
            throw new Error("Можно добавлять только экземпляры класса Player");
        }
        this.players[player.name] = player;
        this.savePlayers();
    }

    static updatePlayer(name, updates) {
        const player = this.getPlayerByName(name);
        if (!player) {
            throw new Error("Игрок не найден");
        }

        Object.assign(player, updates);
        this.savePlayers();
    }

    static removePlayer(name) {
        if (this.players[name]) {
            delete this.players[name];
            this.savePlayers();
        } else {
            throw new Error("Игрок не найден");
        }
    }

    // Удаление игрока по ID
    static removePlayerById(id) {
        const player = this.getPlayerById(id);
        if (player) {
            delete this.players[player.name];
            this.savePlayers();
            console.log(`Игрок с ID ${id} удалён.`);
        } else {
            throw new Error("Игрок не найден");
        }
    }

    static setPlayerSession(name, sessionId) {
        const player = this.getPlayerByName(name);
        if (!player) {
            throw new Error("Игрок не найден");
        }

        if (typeof sessionId !== "string" || sessionId.length === 0) {
            throw new ValidatePlayerError("Некорректный идентификатор сессии", 2);
        }

        player.sessionId = sessionId;
        this.savePlayers();
        console.log(`Игроку ${name} присвоена сессия: ${sessionId}`);
    }
}

module.exports = Player;
