const ValidatePlayerError = require("../Errors/ValidatePlayerError");

class Player {
    constructor(id, name, sessionId = null) {
        this.id = id; // Идентификатор теперь передается при создании игрока
        this.name = name;
        this.sessionId = sessionId;
        this._lives = null;
        this._distance = null;
        this._role = null;
        this._character = null;
        this._weapon = null;
        this._temporaryCards = null;
        this._hand = null;
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
            lives: this._lives,
            distance: this._distance,
            role: this._role,
            character: this._character,
            weapon: this._weapon,
            temporaryCards: this._temporaryCards,
            hand: this._hand,
        };
    }

    getSummaryInfo() {
        return {
            id: this.id,
            name: this.name,
            sessionId: this.sessionId,
            lives: this._lives,
            distance: this._distance,
            role: null, // TODO: Показывает только шерифа
            character: this._character,
            weapon: this._weapon,
            temporaryCards: this._temporaryCards,
            countHand: null,
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
