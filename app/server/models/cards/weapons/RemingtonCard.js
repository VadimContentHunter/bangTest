const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const WeaponCard = require("../WeaponCard");

class RemingtonCard extends WeaponCard {
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
            name: "Ремингтон",
            image: "../resources/imgs/cards/weapons/01_remington.png",
            distance: 3,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new RemingtonCard({
            ownerName: data?.ownerName ?? "",
        });
    }
}

module.exports = RemingtonCard;
