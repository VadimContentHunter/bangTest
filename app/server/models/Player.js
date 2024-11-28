const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../interfaces/aCard");
const CardsCollection = require("../handlers/CardsCollection");
const LivesError = require("../Errors/LivesError");
const Lives = require("../models/Lives");

class Player {
    constructor(id, name, sessionId = null) {
        this.id = id; // Идентификатор теперь передается при создании игрока
        this.name = name;
        this.sessionId = sessionId;
        this._lives = new Lives();
        this._role = null;
        this._character = null;
        this._weapon = null;
        this._temporaryCards = new CardsCollection();
        this._hand = new CardsCollection();
    }

    /**
     * @param {Lives} card
     */
    set lives(value) {
        if (!(value instanceof Lives)) {
            throw new ValidatePlayerError("Жизнь игрока должна быть класс Lives");
        }

        this._lives = value;
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

    set temporaryCards(collection) {
        if (!(collection instanceof CardsCollection)) {
            throw new ValidatePlayerError(
                "Коллекция временных карт должна быть экземпляром CardsCollection."
            );
        }

        this._temporaryCards = collection;
    }

    set hand(collection) {
        if (!(collection instanceof CardsCollection)) {
            throw new ValidatePlayerError(
                "Коллекция карт в руке должна быть экземпляром CardsCollection."
            );
        }

        this._hand = collection;
    }

    /**
     * @returns {Lives}
     */
    get lives() {
        if (!(this._lives instanceof Lives)) {
            throw new ValidatePlayerError("Жизнь игрока должна быть класс Lives");
        }

        return this._lives;
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

    get temporaryCards() {
        if (!(this._temporaryCards instanceof CardsCollection)) {
            throw new ValidatePlayerError(
                "Коллекция временных карт должна быть экземпляром CardsCollection."
            );
        }
        return this._temporaryCards;
    }

    get hand() {
        if (!(this._hand instanceof CardsCollection)) {
            throw new ValidatePlayerError(
                "Коллекция карт в руке должна быть экземпляром CardsCollection."
            );
        }

        return this._hand;
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
            role: this.role,
            character: this.character,
            weapon: this.weapon,
            temporaryCards: this.temporaryCards,
            hand: this.hand,
        };
    }

    getSummaryInfo() {
        return {
            id: this.id,
            name: this.name,
            sessionId: this.sessionId,
            lives: this._lives,
            role: null, // TODO: Показывает только шерифа
            character: this.character,
            weapon: this.weapon,
            temporaryCards: this.temporaryCards,
            countHand: this.hand.countCards(),
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
