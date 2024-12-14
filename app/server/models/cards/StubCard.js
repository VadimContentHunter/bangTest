const {aCard, CardType} = require("../../interfaces/aCard");

class StubCard extends aCard {
    constructor(type = CardType.DEFAULT, ownerName = "") {
        super({
            name: "Stub Card",
            image: "../resources/imgs/cards/cardBacks/girl.png",
            type: type,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new StubCard(data.type, data.ownerName);
    }
}

module.exports = StubCard;
