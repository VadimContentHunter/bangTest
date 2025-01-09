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

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = BlackJack;
