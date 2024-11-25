const {aCard, CardType} = require("../../interfaces/aCard");

class StubCard extends aCard {
    constructor(type = CardType.DEFAULT) {
        super();
        this.name = "Stub Card";
        this.image = "resources/imgs/cards/cardBacks/girl.png";
        this.type = type;
    }
}
