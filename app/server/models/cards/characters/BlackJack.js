const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");

class BlackJack extends aCard {
    constructor(ownerName = "") {
        super({
            name: "Black Jack",
            image: "../resources/imgs/cards/characters/01_blackjack.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
        });
    }

    static initFromJSON(data) {
        return new BlackJack(data?.ownerName ?? "");
    }

    action() {}
}

module.exports = BlackJack;
