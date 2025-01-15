const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const WeaponCard = require("../WeaponCard");

class CarabinCard extends WeaponCard {
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
            name: "Карабин",
            image: "../resources/imgs/cards/weapons/01_carabine.png",
            distance: 4,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new CarabinCard({
            ownerName: data?.ownerName ?? "",
        });
    }
}

module.exports = CarabinCard;
