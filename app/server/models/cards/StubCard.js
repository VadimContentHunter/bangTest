const {aCard, CardType} = require("../../interfaces/aCard");

class StubCard extends aCard {
    constructor(type = CardType.DEFAULT) {
        super("Stub Card", "../resources/imgs/cards/cardBacks/girl.png", type);
    }
}

module.exports = StubCard;
