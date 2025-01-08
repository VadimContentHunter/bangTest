const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const GameTable = require("../../../models/GameTable");

/**
 * Класс BartCassidy представляет карту персонажа "Bart Cassidy".
 * Он наследует от базового класса aCard и имеет дополнительные свойства для жизней, игровой таблицы и руки игрока.
 */
class BartCassidy extends aCard {
    #lives = null;
    #gameTable = null;
    #hand = null;

    /**
     * Создаёт новый объект BartCassidy.
     * @param {Lives|null} lives - Объект, представляющий жизни персонажа.
     * @param {GameTable|null} gameTable - Игровая таблица.
     * @param {CardsCollection|null} hand - Коллекция карт в руке игрока.
     * @param {string} ownerName - Имя владельца карты.
     * @throws {CardError} Если переданы некорректные параметры.
     */
    constructor(lives = null, gameTable = null, hand = null, ownerName = "") {
        super({
            name: "Bart Cassidy",
            image: "../resources/imgs/cards/characters/01_bartcassidy.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
        });

        this.lives = lives; // Используем сеттер
        this.gameTable = gameTable; // Используем сеттер
        this.hand = hand; // Используем сеттер
    }

    /**
     * Возвращает текущие жизни персонажа.
     * @returns {Lives|null} Текущее количество жизней.
     */
    get lives() {
        return this.#lives;
    }

    /**
     * Устанавливает количество жизней персонажа.
     * @param {Lives|null} value - Объект Lives или null.
     * @throws {CardError} Если передано некорректное значение.
     */
    set lives(value) {
        if (value === null || value instanceof Lives) {
            this.#lives = value;
        } else {
            throw new CardError(
                "BartCassidy: Invalid lives provided. Must be an instance of Lives or null."
            );
        }
    }

    /**
     * Возвращает текущую игровую таблицу.
     * @returns {GameTable|null} Текущая игровая таблица.
     */
    get gameTable() {
        return this.#gameTable;
    }

    /**
     * Устанавливает игровую таблицу.
     * @param {GameTable|null} value - Объект GameTable или null.
     * @throws {CardError} Если передано некорректное значение.
     */
    set gameTable(value) {
        if (value === null || value instanceof GameTable) {
            this.#gameTable = value;
        } else {
            throw new CardError(
                "BartCassidy: Invalid gameTable provided. Must be an instance of GameTable or null."
            );
        }
    }

    /**
     * Возвращает текущую руку игрока.
     * @returns {CardsCollection|null} Текущая коллекция карт в руке игрока.
     */
    get hand() {
        return this.#hand;
    }

    /**
     * Устанавливает коллекцию карт в руке игрока.
     * @param {CardsCollection|null} value - Коллекция карт или null.
     * @throws {CardError} Если передано некорректное значение.
     */
    set hand(value) {
        if (value === null || value instanceof CardsCollection) {
            this.#hand = value;
        } else {
            throw new CardError(
                "BartCassidy: Invalid hand provided. Must be an instance of CardsCollection or null."
            );
        }
    }

    /**
     * Инициализирует объект BartCassidy из JSON данных.
     * @param {Object} data - Данные для инициализации.
     * @param {Lives|null} [data.lives=null] - Количество жизней.
     * @param {GameTable|null} [data.gameTable=null] - Игровая таблица.
     * @param {CardsCollection|null} [data.hand=null] - Коллекция карт в руке игрока.
     * @param {string} [data.ownerName=""] - Имя владельца карты.
     * @returns {BartCassidy} Новый объект BartCassidy.
     */
    static initFromJSON(data) {
        return new BartCassidy(
            data?.lives ?? null,
            data?.gameTable ?? null,
            data?.hand,
            data?.ownerName ?? ""
        );
    }

    /**
     * Действие персонажа Bart Cassidy.
     * @listens Lives#lifeRemoved Обрабатывает событие "lifeRemoved", которое вызывается при удалении жизней.
     * @throws {CardError} Если передан некорректный объект Lives.
     */
    action() {
        if (this.lives instanceof Lives) {
            /**
             * Обрабатывает событие "lifeRemoved", которое вызывается при удалении жизней.
             *
             * @listens Lives#lifeRemoved
             * @param {Object} param0 - Объект, содержащий данные о жизнях.
             * @param {number} param0.oldLives - Старое количество жизней до уменьшения.
             * @param {number} param0.newLives - Новое количество жизней после уменьшения.
             * @param {number} param0.removed - Количество удалённых жизней.
             * @throws {CardError} Если значение removed не является числом.
             */
            this.lives.events.on("lifeRemoved", ({ oldLives, newLives, removed }) => {
                if (typeof removed !== "number" || isNaN(removed) && removed < 0) {
                    throw new CardError(
                        "BartCassidy: Invalid 'removed' value. It must be a number. And removed < 0"
                    );
                }
                this.gameTable.drawCardFromMainDeck(removed, this.hand);
            });
        } else {
            throw new CardError("BartCassidy: Invalid lives provided");
        }
    }
}

module.exports = BartCassidy;
