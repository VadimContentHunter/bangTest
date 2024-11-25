const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../interfaces/aCard");
const StubCard = require("./cards/StubCard");
const CardError = require("../Errors/CardError");

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

    /**
     * @param {aCard} card
     */
    set role(card) {
        if (!(card instanceof aCard)) {
            throw new ValidatePlayerError("Роль игрока должен быть класса aCard.");
        }

        if (card.type !== CardType.ROLE) {
            throw new ValidatePlayerError("Карта для роли должна быть type = ROLE.");
        }

        this._role = card;
    }

    /**
     * @param {aCard} card
     */
    set character(card) {
        if (!(card instanceof aCard)) {
            throw new ValidatePlayerError("Персонаж игрока должен быть класса aCard.");
        }

        if (card.type !== CardType.CHARACTER) {
            throw new ValidatePlayerError("Карта для Персонажа должна быть type = CHARACTER.");
        }

        this._character = card;
    }

    /**
     * @param {aCard} card
     */
    set weapon(card) {
        if (!(card instanceof aCard)) {
            throw new ValidatePlayerError("Персонаж игрока должен быть класса aCard.");
        }

        if (card.type !== CardType.WEAPON) {
            throw new ValidatePlayerError("Карта для роли должна быть type = WEAPON.");
        }

        this._weapon = card;
    }

    /**
     * @returns {aCard | null}
     */
    get role() {
        return this._role;
    }

    /**
     * @returns {aCard | null}
     */
    get character() {
        return this._character;
    }

    /**
     * @returns {aCard | null}
     */
    get weapon() {
        return this._weapon;
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
            // distance: this._distance,
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
