const { aCard, CardType, CardSuit, CardRank } = require("../../interfaces/aCard");
const CardError = require("../../Errors/CardError");
const CardsCollection = require("../../handlers/CardsCollection");

class DefaultCard extends aCard {
    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} params.name - Название карты.
     * @param {string} params.image - Путь к изображению карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.targetName=""] - Имя Цели карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({
        name,
        image,
        ownerName = "",
        targetName = "",
        suit = CardSuit.NONE,
        rank = CardRank.NONE,
    }) {
        super({
            name: name,
            image: image,
            type: CardType.DEFAULT,
            ownerName: ownerName,
            targetName: targetName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new DefaultCard(
            data.name,
            data.image,
            data?.ownerName ?? "",
            data?.targetName ?? ""
        );
    }

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = DefaultCard;
