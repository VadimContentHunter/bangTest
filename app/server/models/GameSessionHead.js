const ServerError = require("../Errors/ServerError");
const PlayerCollection = require("../handlers/PlayerCollection");
const Player = require("./Player");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const CardsCollection = require("../handlers/CardsCollection");

class GameSessionHead {
    #statusGame = false;
    #collectionRolesCards = null;
    #collectionCharactersCards = null;
    #collectionGameCards = null;

    constructor() {
        this.#collectionRolesCards =
            this.#collectionRolesCards === null
                ? new CardsCollection()
                : this.#collectionRolesCards;

        this.#collectionCharactersCards =
            this.#collectionCharactersCards === null
                ? new CardsCollection()
                : this.#collectionCharactersCards;

        this.#collectionGameCards =
            this.#collectionGameCards === null ? new CardsCollection() : this.#collectionGameCards;
    }

    /**
     * Получить текущий статус игры.
     * @returns {boolean} Текущий статус игры.
     */
    get statusGame() {
        return this.#statusGame;
    }

    /**
     * Установить статус игры.
     * @param {boolean} status - Новый статус игры.
     * @throws {TypeError} Если передано не булево значение.
     */
    set statusGame(status) {
        if (typeof status !== "boolean") {
            throw new TypeError("statusGame должен быть булевым значением.");
        }
        this.#statusGame = status;
    }

    /**
     * Получить коллекцию карт ролей.
     * @returns {CardsCollection} Коллекция карт ролей.
     */
    get collectionRolesCards() {
        return this.#collectionRolesCards;
    }

    /**
     * Установить коллекцию карт ролей.
     * @param {CardsCollection} collection - Новая коллекция карт ролей.
     * @throws {TypeError} Если передано не значение типа CardsCollection.
     */
    set collectionRolesCards(collection) {
        if (!(collection instanceof CardsCollection)) {
            throw new TypeError("collectionRolesCards должен быть экземпляром CardsCollection.");
        }
        this.#collectionRolesCards = collection;
    }

    /**
     * Получить коллекцию карт персонажей.
     * @returns {CardsCollection} Коллекция карт персонажей.
     */
    get collectionCharactersCards() {
        return this.#collectionCharactersCards;
    }

    /**
     * Установить коллекцию карт персонажей.
     * @param {CardsCollection} collection - Новая коллекция карт персонажей.
     * @throws {TypeError} Если передано не значение типа CardsCollection.
     */
    set collectionCharactersCards(collection) {
        if (!(collection instanceof CardsCollection)) {
            throw new TypeError(
                "collectionCharactersCards должен быть экземпляром CardsCollection."
            );
        }
        this.#collectionCharactersCards = collection;
    }

    /**
     * Получить коллекцию игровых карт.
     * @returns {CardsCollection} Коллекция игровых карт.
     */
    get collectionGameCards() {
        return this.#collectionGameCards;
    }

    /**
     * Установить коллекцию игровых карт.
     * @param {CardsCollection} collection - Новая коллекция игровых карт.
     * @throws {TypeError} Если передано не значение типа CardsCollection.
     */
    set collectionGameCards(collection) {
        if (!(collection instanceof CardsCollection)) {
            throw new TypeError("collectionGameCards должен быть экземпляром CardsCollection.");
        }
        this.#collectionGameCards = collection;
    }

    toJSON() {
        return {
            statusGame: this.statusGame,
            collectionRolesCards: this.collectionRolesCards, // можно сериализовать, если нужно
            collectionCharactersCards: this.collectionCharactersCards, // можно сериализовать, если нужно
            collectionGameCards: this.collectionGameCards, // можно сериализовать, если нужно
        };
    }

    static initFromJSON(json) {
        const gameSessionHeadHandler = new GameSessionHead();
        gameSessionHeadHandler.statusGame = json.statusGame;
        gameSessionHeadHandler.collectionRolesCards = CardsCollection.initFromJSON(
            json.collectionRolesCards,
            false
        );
        gameSessionHeadHandler.collectionCharactersCards = CardsCollection.initFromJSON(
            json.collectionCharactersCards,
            false
        );
        gameSessionHeadHandler.collectionGameCards = CardsCollection.initFromJSON(
            json.collectionGameCards,
            false
        );
        return gameSessionHeadHandler;
    }
}

module.exports = GameSessionHead;
