const ValidatePlayerError = require("../Errors/ValidatePlayerError");

class Player {
    constructor(id, name, sessionId = null) {
        this.id = id; // Идентификатор теперь передается при создании игрока
        this.name = name;
        this.sessionId = sessionId;
    }

    setSession(sessionId) {
        if (typeof sessionId !== "string" || sessionId.length === 0) {
            throw new ValidatePlayerError("Некорректный идентификатор сессии");
        }
        this.sessionId = sessionId;
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
        console.log(`Данные игрока ${this.name} обновлены.`);
    }

    remove() {
        console.log(`Игрок ${this.name} удалён.`);
    }
}

module.exports = Player;
