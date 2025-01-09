const { aCard, CardType, CardSuit } = require("../../interfaces/aCard");

class StubCard extends aCard {
    constructor({ type = CardType.DEFAULT, ownerName = "", suit = CardSuit.NONE } = {}) {
        super({
            name: "Stub Card",
            image: "../resources/imgs/cards/cardBacks/girl.png",
            type: type,
            ownerName: ownerName,
            suit: suit,
        });
    }

    static initFromJSON(data) {
        return new StubCard({
            type: data.type,
            ownerName: data.ownerName,
        });
    }

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = StubCard;
