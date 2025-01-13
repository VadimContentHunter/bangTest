const CardError = require("../../../Errors/CardError");
const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const GameTable = require("../../GameTable");
const Player = require("../../Player");
const SelectionCards = require("../../SelectionCards");
const ConstantCard = require("../ConstantCard");

class BarrelCard extends ConstantCard {
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
    constructor({ ownerName = "", suit = CardSuit.NONE, rank = CardRank.NONE }) {
        super({
            name: "Бочка",
            image: "../resources/imgs/cards/constCards/01_barile.png",
            type: CardType.CONST,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new BarrelCard({
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

        if (!Number.isInteger(damage)) {
            throw new TypeError("Damage должен быть целым числом (урон по игроку).");
        }

        if (damage > 0) {
            let card = this.#cardGameTable.showRandomsCards(1)[0] ?? null;

            const selectionCards = new SelectionCards({
                title: `Событие карты ${this.name}`,
                description: "Если карта масти 'Черва', игрок не получает урон",
                textExtension: `У игрока <i>${
                    this.#cardPlayer?.name || "неизвестный"
                }</i> вытянул карту: 
                        (<b><i>${card.name}</i></b>, <b><i>${card.suit}</i></b>, <b><i>${
                    card.rank
                }</i></b>)`,
                collectionCards: [card],
                selectionCount: 0,
                isWaitingForResponse: false,
            });

            /**
             * Событие, которое вызывает отображение карт.
             * @event GameTable#showCards
             * @type {Object}
             * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
             * @property {SelectionCards} selectionCards - Объект выбора карт.
             */
            this.#cardPlayer.events.emit("showCards", { selectionCards });

            console.log(
                `У игрока ${this.#cardPlayer?.name} сработала бочка. Игрок вытянул карту: ${
                    card.name
                }, ${card.suit}.`
            );
            return card instanceof aCard && card.suit === CardSuit.HEARTS ? false : true;
        }
    }

    removeEventListener() {
        if (this.#cardPlayer?.events && this.boundHandler !== null) {
            this.#cardPlayer.events.off("beforeDrawCards", this.boundHandler);
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
             * Если вернуть false урон не будет нанесен игроку
             *
             * @listens Player#beforeDamage
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

module.exports = BarrelCard;
