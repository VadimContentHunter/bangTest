const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../interfaces/aCard");
const CardsCollection = require("../handlers/CardsCollection");
const LivesError = require("../Errors/LivesError");
const Lives = require("../models/Lives");

class Player {
    /**
     * Конструктор для создания игрока.
     * @param {number} id - Идентификатор игрока.
     * @param {string} name - Имя игрока.
     * @param {string|null} [sessionId=null] - Идентификатор сессии игрока.
     */
    constructor(id, name, sessionId = null) {
        this.id = id;
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
     * Сеттер для lives.
     * @param {Lives|null} value - Значение для установки жизни игрока.
     * @throws {ValidatePlayerError} - Ошибка валидации, если передано неправильное значение.
     */
    set lives(value) {
        if (value !== null && !(value instanceof Lives)) {
            throw new ValidatePlayerError("Жизнь игрока должна быть класс Lives или null.");
        }

        this._lives = value;
    }

    /**
     * Сеттер для роли игрока.
     * @param {aCard|null} card - Карта роли игрока.
     * @throws {ValidatePlayerError} - Ошибка валидации, если карта не соответствующего типа.
     */
    set role(card) {
        if (card !== null && !(card instanceof aCard)) {
            throw new ValidatePlayerError("Роль игрока должна быть класса aCard или null.");
        }

        if (card !== null && card.type !== CardType.ROLE) {
            throw new ValidatePlayerError("Карта для роли должна быть type = ROLE.");
        }

        this._role = card;
    }

    /**
     * Сеттер для персонажа игрока.
     * @param {aCard|null} card - Карта персонажа игрока.
     * @throws {ValidatePlayerError} - Ошибка валидации, если карта не соответствующего типа.
     */
    set character(card) {
        if (card !== null && !(card instanceof aCard)) {
            throw new ValidatePlayerError("Персонаж игрока должен быть класса aCard или null.");
        }

        if (card !== null && card.type !== CardType.CHARACTER) {
            throw new ValidatePlayerError("Карта для персонажа должна быть type = CHARACTER.");
        }

        this._character = card;
    }

    /**
     * Сеттер для оружия игрока.
     * @param {aCard|null} card - Карта оружия игрока.
     * @throws {ValidatePlayerError} - Ошибка валидации, если карта не соответствующего типа.
     */
    set weapon(card) {
        if (card !== null && !(card instanceof aCard)) {
            throw new ValidatePlayerError("Оружие игрока должно быть класса aCard или null.");
        }

        if (card !== null && card.type !== CardType.WEAPON) {
            throw new ValidatePlayerError("Карта для оружия должна быть type = WEAPON.");
        }

        this._weapon = card;
    }

    /**
     * Сеттер для коллекции временных карт игрока.
     * @param {CardsCollection|null} collection - Коллекция временных карт.
     * @throws {ValidatePlayerError} - Ошибка валидации, если передана неправильная коллекция.
     */
    set temporaryCards(collection) {
        if (collection !== null && !(collection instanceof CardsCollection)) {
            throw new ValidatePlayerError(
                "Коллекция временных карт должна быть экземпляром CardsCollection или null."
            );
        }

        this._temporaryCards = collection;
    }

    /**
     * Сеттер для коллекции карт в руке игрока.
     * @param {CardsCollection|null} collection - Коллекция карт в руке.
     * @throws {ValidatePlayerError} - Ошибка валидации, если передана неправильная коллекция.
     */
    set hand(collection) {
        if (collection !== null && !(collection instanceof CardsCollection)) {
            throw new ValidatePlayerError(
                "Коллекция карт в руке должна быть экземпляром CardsCollection или null."
            );
        }

        this._hand = collection;
    }

    /**
     * Геттер для жизни игрока.
     * @returns {Lives|null} - Жизнь игрока.
     */
    get lives() {
        return this._lives;
    }

    /**
     * Геттер для роли игрока.
     * @returns {aCard|null} - Роль игрока.
     */
    get role() {
        return this._role;
    }

    /**
     * Геттер для персонажа игрока.
     * @returns {aCard|null} - Персонаж игрока.
     */
    get character() {
        return this._character;
    }

    /**
     * Геттер для оружия игрока.
     * @returns {aCard|null} - Оружие игрока.
     */
    get weapon() {
        return this._weapon;
    }

    /**
     * Геттер для коллекции временных карт.
     * @returns {CardsCollection|null} - Коллекция временных карт.
     */
    get temporaryCards() {
        return this._temporaryCards;
    }

    /**
     * Геттер для коллекции карт в руке.
     * @returns {CardsCollection|null} - Коллекция карт в руке.
     */
    get hand() {
        return this._hand;
    }

    /**
     * Устанавливает сессию для игрока.
     * @param {string} sessionId - Идентификатор сессии.
     * @throws {ValidatePlayerError} - Ошибка, если идентификатор сессии некорректен.
     */
    setSession(sessionId) {
        if (typeof sessionId !== "string" || sessionId.length === 0) {
            throw new ValidatePlayerError("Некорректный идентификатор сессии");
        }
        this.sessionId = sessionId;
        console.log(`Игроку ${this.name} присвоена сессия: ${sessionId}`);
    }

    /**
     * Возвращает полную информацию о игроке.
     * @returns {Object} - Объект с полной информацией о игроке.
     */
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

    /**
     * Возвращает краткую информацию о игроке.
     * @returns {Object} - Объект с краткой информацией о игроке.
     */
    getSummaryInfo() {
        return {
            id: this.id,
            name: this.name,
            sessionId: this.sessionId,
            lives: this.lives,
            role: this.role instanceof SheriffCard ? this.role : null,
            character: this.character,
            weapon: this.weapon,
            temporaryCards: this.temporaryCards,
            countHand: this.hand.countCards(),
        };
    }

    /**
     * Обновляет данные игрока.
     * @param {Object} updates - Объект с новыми данными для обновления.
     */
    update(updates) {
        Object.assign(this, updates);
        console.log(`Данные игрока ${this.name} обновлены.`);
    }

    /**
     * Удаляет игрока.
     */
    remove() {
        console.log(`Игрок ${this.name} удалён.`);
    }

    /**
     * Преобразует игрока в JSON.
     * @returns {Object} - Объект в формате JSON, содержащий данные игрока.
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
     * Инициализирует игрока из JSON данных.
     * @param {Object} data - Данные для инициализации игрока.
     * @returns {Player} - Новый экземпляр игрока.
     * @throws {ValidatePlayerError} - Ошибка валидации, если данные некорректны.
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

        if (data?.role !== null) {
            data?.role.lives = player.lives;
            data?.role.ownerName = player.name;
            player.role = aCard.initCard(data?.role, CardsCollection.typesCards);
        }

        if (data?.character !== null) {
            player.character = aCard.initCard(data?.character, CardsCollection.typesCards);
        }

        if (data?.weapon !== null) {
            player.weapon = aCard.initCard(data?.weapon, CardsCollection.typesCards);
        }

        if (data?.temporaryCards !== null) {
            player.temporaryCards = CardsCollection.initFromJSON(data?.temporaryCards);
        }

        if (data?.hand !== null) {
            player.hand = CardsCollection.initFromJSON(data?.hand);
        }

        return player;
    }

    /**
     * Объединяет данные двух игроков в новом.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @param {Array<string>} propertiesToCopy - Список свойств для копирования.
     * @returns {Player} - Новый игрок с объединёнными данными.
     * @throws {ValidatePlayerError} - Ошибка, если объекты не являются экземплярами Player.
     */
    static newMergePlayers(player1, player2, propertiesToCopy = []) {
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

        propertiesToCopy.forEach((property) => {
            if (player2.hasOwnProperty(property)) {
                newPlayer[property] = player2[property];
            }
        });

        return newPlayer;
    }

    /**
     * Копирует данные одного игрока в другого.
     * @param {Player} mainPlayer - Игрок, в которого копируются данные.
     * @param {Player} player2 - Игрок, чьи данные копируются.
     * @param {Array<string>} [propertiesToCopy=[]] - Список свойств для копирования.
     * @returns {Player} - Обновлённый объект mainPlayer.
     * @throws {ValidatePlayerError} - Ошибка, если объекты не являются экземплярами Player.
     */
    static copyDataPlayer(mainPlayer, player2, propertiesToCopy = []) {
        if (!(mainPlayer instanceof Player) || !(player2 instanceof Player)) {
            throw new ValidatePlayerError("Оба объекта должны быть экземплярами Player.");
        }

        const properties =
            propertiesToCopy.length === 0 ? Object.getOwnPropertyNames(player2) : propertiesToCopy;

        properties.forEach((property) => {
            if (player2.hasOwnProperty(property)) {
                const cleanProperty = property.startsWith("_") ? property.slice(1) : property;

                if (typeof mainPlayer[cleanProperty] !== "undefined") {
                    mainPlayer[cleanProperty] = player2[property];
                }
            }
        });

        return mainPlayer;
    }
}

module.exports = Player;
