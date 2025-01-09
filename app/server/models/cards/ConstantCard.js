const { aCard, CardType } = require("../../interfaces/aCard");
const CardError = require("../../Errors/CardError");
const CardsCollection = require("../../handlers/CardsCollection");

class ConstantCard extends aCard {
    constructor(name, image, ownerName = "", targetName = "") {
        super({
            name: name,
            image: image,
            type: CardType.CONST,
            ownerName: ownerName,
            targetName: targetName,
        });
    }

    static initFromJSON(data) {
        return new ConstantCard(data.name, data.image, data?.ownerName ?? "", data?.targetName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = ConstantCard;
