const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");

class CalamityJanet extends aCard {
    constructor(ownerName = "") {
        super({
            name: "Calamity Janet",
            image: "../resources/imgs/cards/characters/01_calamityjanet.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
            targetName: "",
        });
    }

    static initFromJSON(data) {
        return new CalamityJanet(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {}
}

module.exports = CalamityJanet;
