const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../interfaces/aCard");
const CardsCollection = require("../handlers/CardsCollection");
const LivesError = require("../Errors/LivesError");
const Lives = require("../models/Lives");
const SheriffCard = require("./cards/roles/SheriffCard");
const EventEmitter = require("events");
const DistanceHandler = require("../handlers/DistanceHandler");
const WeaponCard = require("./cards/WeaponCard");
const GameTable = require("./GameTable");
const PlayerInteractionError = require("../Errors/PlayerInteractionError");

class Player {
    /**
     * @type {number|null}
     * @private
     */
    #id = null;

    /**
     * @type {string|null}
     * @private
     */
    #name = null;

    /**
     * @type {string|null}
     * @private
     */
    #sessionId = null;

    /**
     * @type {EventEmitter|null}
     * @private
     */
    #events = null;

    /**
     * @type {Lives|null}
     * @private
     */
    #lives = null;

    /**
     * @type {aCard|null}
     * @private
     */
    #role = null;

    /**
     * @type {aCard|null}
     * @private
     */
    #character = null;

    /**
     * @type {aCard|null}
     * @private
     */
    #weapon = null;

    /**
     * @type {CardsCollection|null}
     * @private
     */
    #temporaryCards = null;

    /**
     * @type {CardsCollection|null}
     * @private
     */
    #hand = null;

    /**
     * Конструктор для создания игрока.
     * @param {number} id - Идентификатор игрока.
     * @param {string} name - Имя игрока.
     * @param {string|null} [sessionId=null] - Идентификатор сессии игрока.
     * @param {EventEmitter|null} [events=null] - Объект EventEmitter для игрока, хранящий события, привязанные к игроку.
     */
    constructor(id, name, sessionId = null, events = null) {
        this.events = events ?? new EventEmitter();

        this.id = id;
        this.name = name;
        this.sessionId = sessionId;
        this.lives = new Lives();
        this.role = null;
        this.character = null;
        this.weapon = null;
        this.temporaryCards = new CardsCollection();
        this.hand = new CardsCollection();
    }

    /**
     * Геттер для идентификатора игрока.
     * @returns {number}
     */
    get id() {
        return this.#id;
    }

    /**
     * Сеттер для идентификатора игрока.
     * @param {number} value
     * @throws {ValidatePlayerError} Если идентификатор невалидный.
     */
    set id(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new ValidatePlayerError("ID must be a positive integer or 0.");
        }
        this.#id = value;
    }

    /**
     * Геттер для имени игрока.
     * @returns {string} Имя игрока.
     */
    get name() {
        return this.#name;
    }

    /**
     * Сеттер для имени игрока.
     * @param {string} value - Новое имя игрока.
     * @throws {ValidatePlayerError} Если имя невалидное.
     */
    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new ValidatePlayerError("Name must be a non-empty string.");
        }
        this.#name = value;
    }

    /**
     * Геттер для идентификатора сессии игрока.
     * @returns {string|null} Идентификатор сессии игрока.
     */
    get sessionId() {
        return this.#sessionId;
    }

    /**
     * Сеттер для идентификатора сессии игрока.
     * @param {string|null} value - Новый идентификатор сессии.
     */
    set sessionId(value) {
        if (value !== null && typeof value !== "string") {
            throw new ValidatePlayerError("Session ID must be a string or null.");
        }
        this.#sessionId = value;
    }

    /**
     * Геттер для объекта EventEmitter.
     * @returns {EventEmitter|null} Объект EventEmitter.
     */
    get events() {
        return this.#events;
    }

    /**
     * Сеттер для объекта EventEmitter.
     * @param {EventEmitter|null} value - Новый объект EventEmitter.
     */
    set events(value) {
        if (value !== null && !(value instanceof EventEmitter)) {
            throw new ValidatePlayerError("events must be an instance of EventEmitter or null.");
        }
        this.#events = value;
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

        if (value instanceof Lives) {
            value.events = this.events;
        }

        this.#lives = value;
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

        this.#role = card;
        this.events?.emit("roleInstalled", { card, player: this });
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

        this.#character = card;
        this.events?.emit("characterInstalled", { card, player: this });
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

        this.#weapon = card;
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

        this.#temporaryCards = collection;
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

        this.#hand = collection;
    }

    /**
     * Геттер для жизни игрока.
     * @returns {Lives|null} - Жизнь игрока.
     */
    get lives() {
        return this.#lives;
    }

    /**
     * Геттер для роли игрока.
     * @returns {aCard|null} - Роль игрока.
     */
    get role() {
        return this.#role;
    }

    /**
     * Геттер для персонажа игрока.
     * @returns {aCard|null} - Персонаж игрока.
     */
    get character() {
        return this.#character;
    }

    /**
     * Геттер для оружия игрока.
     * @returns {aCard|null} - Оружие игрока.
     */
    get weapon() {
        return this.#weapon;
    }

    /**
     * Геттер для коллекции временных карт.
     * @returns {CardsCollection|null} - Коллекция временных карт.
     */
    get temporaryCards() {
        return this.#temporaryCards;
    }

    /**
     * Геттер для коллекции карт в руке.
     * @returns {CardsCollection|null} - Коллекция карт в руке.
     */
    get hand() {
        return this.#hand;
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
     * Игрок получает урон от другого игрока.
     * @param {Player} attackingPlayer - Игрок, который наносит урон.
     * @param {number} damage - Количество урона, который игрок должен получить.
     * @param {DistanceHandler} playersDistances - Объект, который управляет дистанциями между игроками.
     * @throws {ValidatePlayerError} Если атакующий игрок не является экземпляром класса Player.
     * @throws {ValidatePlayerError} Если урон не является положительным целым числом.
     * @throws {ValidatePlayerError} Если объект с дистанциями не является экземпляром класса DistanceHandler.
     * @throws {ValidatePlayerError} Если дистанция между игроками не найдена.
     * @throws {ValidatePlayerError} Если дистанция до атакующего игрока слишком большая для нанесения урона.
     */
    takeDamageFromPlayer(attackingPlayer, damage, playersDistances) {
        if (!(attackingPlayer instanceof Player)) {
            throw new ValidatePlayerError("Атакующий игрок должен быт объектом класса Player");
        }

        if (!Number.isInteger(damage) || damage <= 0) {
            throw new ValidatePlayerError("Урон должен быть положительным целым числом");
        }

        if (!(playersDistances instanceof DistanceHandler)) {
            throw new ValidatePlayerError(`Не удалось найти дистанцию игроков`);
        }

        let distanceValue = playersDistances.getDistanceValue(this, attackingPlayer);
        if (distanceValue === null) {
            throw new ValidatePlayerError(
                `Дистанция между атакующим игроком "${attackingPlayer.name}" не найдена.`
            );
        }

        if (this.weapon instanceof WeaponCard && distanceValue <= this.weapon.distance) {
            this.lives.removeLives(damage);
        } else {
            throw new PlayerInteractionError(
                `Не удалось нанести урон игроку "${this.name}", Дистанция до игрока, слишком большая.`
            );
        }
    }

    /**
     * Игрок берет карты из основной колоды.
     * @param {GameTable} gameTable - Игровой стол, на котором находится колода.
     * @param {number} count - Количество карт, которые игрок должен взять.
     * @returns {aCard[]} Массив взятых карт (копий).
     * @throws {ValidatePlayerError} Если игровая таблица не является экземпляром класса GameTable.
     * @throws {ValidatePlayerError} Если параметр 'count' не является положительным целым числом.
     * @fires GameTable#cardDrawn Событие, которое срабатывает, когда игрок берет карты из колоды.
     */
    drawFromDeck(gameTable, count) {
        if (!(gameTable instanceof GameTable)) {
            throw new ValidatePlayerError("Игровой стол должен быть экземпляром GameTable");
        }

        // Проверка, что count является целым числом
        if (!Number.isInteger(count) || count <= 0) {
            throw new ValidatePlayerError(
                "Параметр 'count' должен быть положительным целым числом."
            );
        }

        const drawnCards = gameTable.deckMain.pullRandomCards(count);

        // Создаем копии карт, чтобы вернуть их наружу
        const copiedCards = drawnCards.map((card) => ({ ...card }));

        // Добавляем карты в руку игрока
        this.hand.addArrayCards(drawnCards, false);

        // Вызываем событие, что карты были взяты
        if (this.events) {
            /**
             * @event GameTable#cardDrawn
             * @type {Object}
             * @property {Player} player - Игрок, который взял карты.
             * @property {aCard[]} drawnCards - Массив карт, которые были взяты игроком.
             */
            this.events.emit("cardDrawn", {
                drawingPlayer: this,
                drawnCards: copiedCards,
            });
        }

        return copiedCards; // Возвращаем копии карт
    }

    /**
     * Игрок сбрасывает карты в колоду сброса.
     * @param {GameTable} gameTable - Игровой стол, на котором находится колода.
     * @param {Array} cardIds - Массив ID карт, которые игрок хочет сбросить.
     * @returns {aCard[]} Массив копий сброшенных карт (копий).
     * @throws {ValidatePlayerError} Если cardIds не является массивом.
     * @throws {ValidatePlayerError} Если карты с такими ID не найдены в руке игрока.
     * @fires GameTable#cardDiscarded Событие, которое срабатывает, когда игрок сбрасывает карты.
     */
    discardCards(gameTable, cardIds) {
        if (!(gameTable instanceof GameTable)) {
            throw new ValidatePlayerError("Игровой стол должен быть экземпляром GameTable");
        }

        if (!Array.isArray(cardIds)) {
            throw new ValidatePlayerError("Параметр 'cardIds' должен быть массивом.");
        }

        const cardsToDiscard = this.hand.pullCardsByIds(cardIds);
        if (cardsToDiscard.length === 0) {
            throw new ValidatePlayerError("Карты с указанными ID не найдены в руке игрока.");
        }

        // Создаем копии карт, чтобы вернуть их наружу
        const copiedCards = cardsToDiscard.map((card) => ({ ...card }));

        // Добавляем сброшенные карты в колоду сброса
        gameTable.discardDeck.addArrayCards(cardsToDiscard, false);

        // Вызываем событие о сбросе карт
        if (this.events instanceof EventEmitter) {
            /**
             * @event GameTable#cardDiscarded
             * @type {Object}
             * @property {Player} player - Игрок, который сбросил карты.
             * @property {aCard[]} discardedCards - Массив карт, которые были сброшены.
             */
            this.events.emit("cardDiscarded", {
                discardedPlayer: this,
                discardedCards: cardsToDiscard,
            });
        }

        return copiedCards; // Возвращаем копии сброшенных карт
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
            lives: this.lives,
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
