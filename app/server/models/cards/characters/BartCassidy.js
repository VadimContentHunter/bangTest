const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const GameTable = require("../../../models/GameTable");
const Player = require("../../../models/Player");

/**
 * Класс BartCassidy представляет карту персонажа "Bart Cassidy".
 * Он наследует от базового класса aCard и имеет дополнительные свойства для жизней, игровой таблицы и руки игрока.
 */
class BartCassidy extends aCard {
    #player = null;
    #gameTable = null;

    /**
     * Создаёт новый объект BartCassidy.
     * @param {Player|null} player - Объект, персонаж.
     * @param {GameTable|null} gameTable - Игровая таблица.
     * @param {string} ownerName - Имя владельца карты.
     * @throws {CardError} Если переданы некорректные параметры.
     */
    constructor(player = null, gameTable = null, ownerName = "") {
        super({
            name: "Bart Cassidy",
            image: "../resources/imgs/cards/characters/01_bartcassidy.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
        });

        this.player = player;
        this.gameTable = gameTable;
    }

    /**
     * Геттер для #player.
     * @returns {Player|null}
     */
    get player() {
        return this.#player;
    }

    /**
     * Сеттер для #player.
     * @param {CardsCollection|null} value - Новое значение для руки карт.
     * @throws {CardError} Если значение не является экземпляром CardsCollection.
     */
    set player(value) {
        if (value === null || value instanceof Player) {
            this.#player = value;
        } else {
            throw new CardError(
                "BlackJack: Invalid player provided. Must be an instance of Player or null."
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
     * Инициализирует объект BartCassidy из JSON данных.
     * @param {Object} data - Данные для инициализации.
     * @param {Player|null} [data.player=null] - Количество жизней.
     * @param {GameTable|null} [data.gameTable=null] - Игровая таблица.
     * @param {string} [data.ownerName=""] - Имя владельца карты.
     * @returns {BartCassidy} Новый объект BartCassidy.
     */
    static initFromJSON(data) {
        return new BartCassidy(
            data?.player ?? null,
            data?.gameTable ?? null,
            data?.ownerName ?? ""
        );
    }

    /**
     * Действие персонажа Bart Cassidy.
     * @listens Lives#lifeRemoved Обрабатывает событие "lifeRemoved", которое вызывается при удалении жизней.
     * @throws {CardError} Если передан некорректный объект Lives.
     */
    action() {
        if (
            this.player instanceof Player &&
            this.player.lives instanceof Lives &&
            this.gameTable instanceof GameTable
        ) {
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
            this.player.lives.events.on("lifeRemoved", ({ oldLives, newLives, removed }) => {
                if (typeof removed !== "number" || (isNaN(removed) && removed < 0)) {
                    throw new CardError(
                        "BartCassidy: Invalid 'removed' value. It must be a number. And removed < 0"
                    );
                }
                this.gameTable?.drawCardsForPlayer(removed, this.player.hand);
            });
        } else {
            throw new CardError("BartCassidy: Invalid lives provided");
        }
    }
}

module.exports = BartCassidy;
