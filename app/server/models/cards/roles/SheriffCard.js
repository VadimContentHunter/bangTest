const {aCard, CardType} = require("../../../interfaces/aCard");

class SheriffCard extends aCard {
    constructor(ownerName = "") {
        super({
            name: "Шериф",
            image: "../resources/imgs/cards/roles/01_sceriffo.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new SheriffCard(data?.ownerName ?? "");
    }
}

module.exports = SheriffCard;
