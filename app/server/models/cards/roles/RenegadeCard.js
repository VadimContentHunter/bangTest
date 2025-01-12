const {aCard, CardType} = require("../../../interfaces/aCard");

class RenegadeCard extends aCard {
    constructor(ownerName = "") {
        super({
            name: "Ренегат",
            image: "../resources/imgs/cards/roles/01_rinnegato.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new RenegadeCard(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {}

    destroy() {}
}

module.exports = RenegadeCard;
