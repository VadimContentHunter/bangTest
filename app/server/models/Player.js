const ValidatePlayerError = require("../Errors/ValidatePlayerError");

class Player {
    constructor(id, name, sessionId = null) {
        this.validateName(name); // Валидация имени при создании

        this.id = id; // Идентификатор теперь передается при создании игрока
        this.name = name;
        this.sessionId = sessionId;
    }

    validateName(name) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой");
        }

        if (name.length <= 4) {
            throw new ValidatePlayerError("Имя должно содержать более 4 символов");
        }

        const regex = /^[A-Za-z]+$/;
        if (!regex.test(name)) {
            throw new ValidatePlayerError("Имя может содержать только латинские буквы (A-Z, a-z)");
        }
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
