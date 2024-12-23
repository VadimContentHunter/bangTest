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
            lives: this.lives,
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
            lives: this.lives,
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

    /**
     * @returns {Object} JSON-представление дистанции
     */
    toJSON() {
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

    /**
     * Инициализирует экземпляр Player из JSON-данных.
     * @param {Object} data - Данные игрока в формате JSON.
     * @returns {Player} Новый экземпляр Player.
     * @throws {ValidatePlayerError} Если данные игрока некорректны.
     */
    static initFromJSON(data) {
        if (typeof data.id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }
        if (typeof data.name !== "string" || data.name.length === 0) {
            throw new ValidatePlayerError("Имя игрока должно быть строкой и не может быть пустым.");
        }
        if (
            typeof data.sessionId !== "undefined" &&
            data.sessionId !== null &&
            typeof data.sessionId !== "string"
        ) {
            throw new ValidatePlayerError("sessionId должен быть строкой или null.");
        }

        const player = new Player(data.id, data.name, data?.sessionId);

        if (data?.lives !== null) {
            player.lives = Lives.initFromJSON(data?.lives);
        }

        // if (data?.role !== null) {
        //     player.role = Lives.initFromJSON(data?.lives);
        // }

        if (data?.character !== null) {
            player.character = aCard.initCard(data?.character, CardsCollection.typesCards);
        }

        // if (data?.weapon !== null) {
        //     player.weapon = Lives.initFromJSON(data?.lives);
        // }

        // if (data?.temporaryCards !== null) {
        //     player.temporaryCards = Lives.initFromJSON(data?.lives);
        // }

        // if (data?.hand !== null) {
        //     player.hand = Lives.initFromJSON(data?.lives);
        // }

        // Создаем и возвращаем новый экземпляр Player
        return player;
    }

    /**
     * Создает новый объект Player, объединяя данные двух игроков.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок, из которого будут скопированы свойства.
     * @param {Array} propertiesToCopy - Массив свойств, которые нужно скопировать со второго игрока.
     * @returns {Player} Новый объект Player, объединяющий свойства двух игроков.
     */
    static newMergePlayers(player1, player2, propertiesToCopy) {
        if (!(player1 instanceof Player) || !(player2 instanceof Player)) {
            throw new ValidatePlayerError("Оба объекта должны быть экземплярами Player.");
        }

        const newPlayer = new Player(player1.id, player1.name, player1.sessionId);
        newPlayer.lives = player1.lives;

        if (player1.role !== null) newPlayer.role = player1.role;
        if (player1.character !== null) newPlayer.character = player1.character;
        if (player1.weapon !== null) newPlayer.weapon = player1.weapon;

        newPlayer.temporaryCards = player1.temporaryCards;
        newPlayer.hand = player1.hand;

        // Копируем только те свойства, которые указаны в массиве propertiesToCopy
        propertiesToCopy.forEach((property) => {
            if (player2.hasOwnProperty(property)) {
                newPlayer[property] = player2[property];
            }
        });
        return newPlayer;
    }

    /**
     * Возвращает Player, с скопированными данными из 2 игрока.
     * @param {Player} mainPlayer - Первый игрок. Основной в который будут копироваться данные.
     * @param {Player} player2 - Второй игрок, из которого будут скопированы свойства.
     * @param {Array} propertiesToCopy - Массив свойств, которые нужно скопировать со второго игрока.
     * @returns {Player} Новый объект Player, объединяющий свойства двух игроков.
     */
    static copyDataPlayer(mainPlayer, player2, propertiesToCopy) {
        if (!(mainPlayer instanceof Player) || !(player2 instanceof Player)) {
            throw new ValidatePlayerError("Оба объекта должны быть экземплярами Player.");
        }

        // Копируем только те свойства, которые указаны в массиве propertiesToCopy
        propertiesToCopy.forEach((property) => {
            if (player2.hasOwnProperty(property)) {
                mainPlayer[property] = player2[property];
            }
        });
        return mainPlayer;
    }
}

module.exports = Player;
