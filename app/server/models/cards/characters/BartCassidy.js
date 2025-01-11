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
        return new BartCassidy(
            data?.ownerName ?? ""
        );
    }

    getActionCallCount() {
        return 0;
    }

    /**
     * Действие персонажа Bart Cassidy.
     * @listens Lives#lifeRemoved Обрабатывает событие "lifeRemoved", которое вызывается при удалении жизней.
     * @throws {CardError} Если передан некорректный объект Lives.
     */
    action({ player, gameTable }) {
        if (player instanceof Player && gameTable instanceof GameTable) {
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
            player.events.on("lifeRemoved", ({ oldLives, newLives, removed }) => {
                if (typeof removed !== "number" || (isNaN(removed) && removed < 0)) {
                    throw new CardError(
                        "BartCassidy: Invalid 'removed' value. It must be a number. And removed < 0"
                    );
                }
                player.drawFromDeck(gameTable, removed, true);
            });
        } else {
            throw new CardError("BartCassidy: Invalid lives provided");
        }
    }
}

module.exports = BartCassidy;
