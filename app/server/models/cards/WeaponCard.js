const { aCard, CardType, CardSuit, CardRank } = require("../../interfaces/aCard");
const CardError = require("../../Errors/CardError");
const CardsCollection = require("../../handlers/CardsCollection");
const ConstantCard = require("./ConstantCard");

class WeaponCard extends aCard {
    _distance = 0;

    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} params.name - Название карты.
     * @param {string} params.image - Путь к изображению карты.
     * @param {string} params.distance - Дистанция оружия.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({
        name,
        image,
        distance,
        ownerName = "",
        suit = CardSuit.NONE,
        rank = CardRank.NONE,
    }) {
        super({
            name: name,
            image: image,
            type: CardType.WEAPON,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });

        this.distance = distance;
    }

    static initFromJSON(data) {
        return new WeaponCard({
            name: data.name,
            image: data.image,
            distance: data.distance,
            ownerName: data?.ownerName ?? "",
            suit: data.suit ?? CardSuit.NONE,
            rank: data.rank ?? CardRank.NONE,
        });
    }

    getActionCallCount() {
        return 0;
    }

    action() {
        this.targetName = "";
    }

    destroy() {}
}

module.exports = WeaponCard;
