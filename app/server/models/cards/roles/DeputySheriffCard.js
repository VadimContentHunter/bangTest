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

    action() {}
}

module.exports = DeputySheriffCard;
