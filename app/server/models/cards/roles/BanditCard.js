const { aCard, CardType } = require("../../../interfaces/aCard");

class BanditCard extends aCard {
    constructor(ownerName = "") {
        super({
            name: "Бандит",
            image: "../resources/imgs/cards/roles/01_fuorilegge.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new BanditCard(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {}

    destroy() {}
}

module.exports = BanditCard;
