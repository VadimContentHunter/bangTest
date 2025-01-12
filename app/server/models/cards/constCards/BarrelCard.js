const CardError = require("../../../Errors/CardError");
const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const GameTable = require("../../GameTable");
const Player = require("../../Player");
const SelectionCards = require("../../SelectionCards");
const ConstantCard = require("../ConstantCard");

class BarrelCard extends ConstantCard {
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

    action({ cardPlayer, cardGameTable }) {
        if (cardPlayer instanceof Player && cardGameTable instanceof GameTable) {
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
            cardPlayer.events.on("beforeDamage", ({ attacker, damage, target, distance }) => {
                if (!Number.isInteger(damage)) {
                    throw new TypeError("Damage должен быть целым числом (урон по игроку).");
                }

                if (damage > 0) {
                    let card = cardGameTable.showRandomsCards(1)[0] ?? null;

                    const selectionCards = new SelectionCards({
                        title: `Событие карты ${this.name}`,
                        description: "Если карта масти 'Черва', игрок не получает урон",
                        textExtension: `У игрока <i>${
                            cardPlayer?.name || "неизвестный"
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
                    cardPlayer.events.emit("showCards", { selectionCards });

                    console.log(
                        `У игрока ${cardPlayer?.name} сработала бочка. Игрок вытянул карту: ${card.name}, ${card.suit}.`
                    );
                    return card instanceof aCard && card.suit === CardSuit.HEARTS ? false : true;
                }
            });
        } else {
            throw new TypeError("Переданный объект не является игроком (Player).");
        }
    }
}

module.exports = BarrelCard;
