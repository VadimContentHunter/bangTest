const CardError = require("../../../Errors/CardError");
const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const GameTable = require("../../GameTable");
const Player = require("../../Player");
const SelectionCards = require("../../SelectionCards");
const ConstantCard = require("../ConstantCard");

class MustangCard extends ConstantCard {
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
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({ ownerName = "", suit = CardSuit.NONE, rank = CardRank.NONE } = {}) {
        super({
            name: "Мустанг",
            image: "../resources/imgs/cards/constCards/01_mustang.png",
            type: CardType.CONST,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new MustangCard({
            ownerName: data?.ownerName ?? "",
            suit: data.suit ?? CardSuit.NONE,
            rank: data.rank ?? CardRank.NONE,
        });
    }

    getActionCallCount() {
        return 0;
    }

    /**
     * Если вернуть false урон не будет нанесен игроку
     *
     * @param {Object} params - Параметры события.
     * @param {Player} params.attacker - Игрок, который наносит урон.
     * @param {number} params.damage - Количество урона, который будет нанесен.
     * @param {Player} params.target - Игрок, который получает урон.
     * @param {number} params.distance - Дистанция между атакующим и целью, которая может ограничивать возможность атаки.
     *
     * @returns {boolean} Возвращает `true`, если урон может быть нанесен, или `false`, если необходимо предотвратить урон.
     */
    handler({ attacker, damage, target, distance }) {
        if (!(this.#cardPlayer instanceof Player)) {
            throw new TypeError("this.#cardPlayer должен быть экземпляром Player");
        }

        if (!(this.#cardGameTable instanceof GameTable)) {
            throw new TypeError("this.#cardGameTable должен быть экземпляром GameTable");
        }

        if (!(target instanceof Player)) {
            throw new TypeError("target должен быть экземпляром Player");
        }

        if (!Number.isInteger(distance)) {
            throw new TypeError("distance должен быть целым числом (Дистанция между игроками).");
        }

        if (this.#cardPlayer === target) {
            return { modifiedDistance: 1 };
        }
    }

    removeEventListener() {
        if (this.#cardPlayer?.events && this.boundHandler !== null) {
            this.#cardPlayer.events.off("beforeDamage", this.boundHandler);
            this.boundHandler = null; // Убираем ссылку для предотвращения повторного использования
        }
    }

    action({ cardPlayer, cardGameTable }) {
        if (cardPlayer instanceof Player && cardGameTable instanceof GameTable) {
            this.#cardPlayer = cardPlayer;
            this.#cardGameTable = cardGameTable;

            // Сохраняем обработчик
            this.boundHandler = this.handler.bind(this);

            /**
             * @listens Player#beforeAttackerAction
             * @param {Object} params - Параметры события.
             * @param {Player} params.attacker - Игрок, который наносит урон.
             * @param {number} params.damage - Количество урона, который будет нанесен.
             * @param {Player} params.target - Игрок, который получает урон.
             * @param {number} params.distance - Дистанция между атакующим и целью, которая может ограничивать возможность атаки.
             *
             * @returns {boolean} Возвращает `true`, если урон может быть нанесен, или `false`, если необходимо предотвратить урон.
             */
            this.#cardPlayer.events.on("beforeDamage", this.boundHandler);
        } else {
            throw new TypeError("Переданный объект не является игроком (Player).");
        }
    }

    destroy() {
        this.removeEventListener();
        this.#cardPlayer = null;
        this.#cardGameTable = null;
    }
}

module.exports = MustangCard;
