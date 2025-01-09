const { aCard, CardType } = require("../../interfaces/aCard");
const CardError = require("../../Errors/CardError");
const CardsCollection = require("../../handlers/CardsCollection");

class ConstantCard extends aCard {
    constructor(name, image, ownerName = "") {
        super({
            name: name,
            image: image,
            type: CardType.CONST,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new ConstantCard(data.name, data.image, data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = BlackJack;
