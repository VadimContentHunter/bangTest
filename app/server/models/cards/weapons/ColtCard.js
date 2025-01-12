const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const WeaponCard = require("../WeaponCard");

class ColtCard extends WeaponCard {
    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({ ownerName = "" } = {}) {
        super({
            name: "Кольт",
            image: "../resources/imgs/cards/weapons/01_colt.png",
            distance: 1,
            ownerName: ownerName,
            suit: CardSuit.CLUBS,
            rank: CardRank.KING,
        });
    }

    static initFromJSON(data) {
        return new ColtCard({
            ownerName: data?.ownerName ?? "",
        });
    }
}

module.exports = ColtCard;
