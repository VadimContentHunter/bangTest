const {aCard, CardType} = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");

class SheriffCard extends aCard {
    constructor(lives, ownerName = "") {
        super({
            name: "Шериф",
            image: "../resources/imgs/cards/roles/01_sceriffo.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });

        if (lives instanceof Lives) {
            lives.addOneLife();
        } else {
            throw new CardError("SheriffCard: Invalid lives provided");
        }
    }

    static initFromJSON(data) {
        return new SheriffCard(data?.lives, data?.ownerName ?? "");
    }
}

module.exports = SheriffCard;
