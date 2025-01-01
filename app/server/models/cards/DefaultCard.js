const { aCard, CardType } = require("../../interfaces/aCard");
const CardError = require("../../Errors/CardError");
const CardsCollection = require("../../handlers/CardsCollection");

class DefaultCard extends aCard {
    constructor(name, image, ownerName = "") {
        super({
            name: name,
            image: image,
            type: CardType.DEFAULT,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new DefaultCard(data.name, data.image, data?.ownerName ?? "");
    }

    action() {}
}

module.exports = BlackJack;
