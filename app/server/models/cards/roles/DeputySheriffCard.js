const {aCard, CardType} = require("../../../interfaces/aCard");

class DeputySheriffCard extends aCard {
    constructor(ownerName = "") {
        super({
            name: "Помощник шерифа",
            image: "../resources/imgs/cards/roles/01_vice.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new DeputySheriffCard(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = DeputySheriffCard;
