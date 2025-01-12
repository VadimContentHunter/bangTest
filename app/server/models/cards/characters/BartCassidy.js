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
    /**
     * @type {Player|null}
     * @private
     */
    #cardPlayer = null;

    /**
     * @type {GameTable|null}
     * @private
     */
    #cardGameTable = null;

    /**
     * Сохраняем привязанный обработчик
     */
    boundHandler = null;

    /**
     * Создаёт новый объект BartCassidy.
     * @param {string} ownerName - Имя владельца карты.
     * @throws {CardError} Если переданы некорректные параметры.
     */
    constructor(ownerName = "") {
        super({
            name: "Bart Cassidy",
            image: "../resources/imgs/cards/characters/01_bartcassidy.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
            targetName: "",
        });
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
        return new BartCassidy(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    /**
     * @param {Object} param0 - Объект, содержащий данные о жизнях.
     * @param {number} param0.oldLives - Старое количество жизней до уменьшения.
     * @param {number} param0.newLives - Новое количество жизней после уменьшения.
     * @param {number} param0.removed - Количество удалённых жизней.
     */
    handler({ oldLives, newLives, removed }) {
        if (!(this.#cardPlayer instanceof Player)) {
            throw new TypeError("this.#cardPlayer должен быть экземпляром Player");
        }

        if (!(this.#cardGameTable instanceof GameTable)) {
            throw new TypeError("this.#cardGameTable должен быть экземпляром GameTable");
        }

        if (typeof removed !== "number" || (isNaN(removed) && removed < 0)) {
            throw new CardError(
                "BartCassidy: Invalid 'removed' value. It must be a number. And removed < 0"
            );
        }
        this.#cardPlayer.drawFromDeck(this.#cardGameTable, removed, true);
    }

    removeEventListener() {
        if (this.#cardPlayer?.events && this.boundHandler !== null) {
            this.#cardPlayer.events.off("beforeDrawCards", this.boundHandler);
            this.boundHandler = null; // Убираем ссылку для предотвращения повторного использования
        }
    }

    /**
     * Действие персонажа Bart Cassidy.
     * @listens Lives#lifeRemoved Обрабатывает событие "lifeRemoved", которое вызывается при удалении жизней.
     * @throws {CardError} Если передан некорректный объект Lives.
     */
    action({ player, gameTable }) {
        if (player instanceof Player && gameTable instanceof GameTable) {
            this.#cardPlayer = player;
            this.#cardGameTable = gameTable;

            // Сохраняем обработчик
            this.boundHandler = this.handler.bind(this);
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
            player.events.on("lifeRemoved", this.boundHandler);
        } else {
            throw new CardError("BartCassidy: Invalid lives provided");
        }
    }

    destroy() {
        this.removeEventListener();
        this.#cardPlayer = null;
        this.#cardGameTable = null;
    }
}

module.exports = BartCassidy;
