const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");

class ElGringo extends aCard {
    constructor(ownerName = "") {
        super({
            name: "El Gringo",
            image: "../resources/imgs/cards/characters/01_elgringo.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new ElGringo(data?.ownerName ?? "");
    }

    action() {}
}

module.exports = ElGringo;
