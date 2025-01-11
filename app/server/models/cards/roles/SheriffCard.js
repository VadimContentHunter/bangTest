const { aCard, CardType } = require("../../../interfaces/aCard");
// const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
// const Player = require("../../Player");

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

    getActionCallCount() {
        return 0;
    }

    action({ player }) {
        const Player = require("../../Player");
        if(!(player instanceof Player)){
            throw new CardError("Invalid player type");
        }

        if (!(player.role instanceof aCard) && player.role !== this) {
            throw new CardError("Не правильная карта стоит у игрока в роле.");
        }

        player.lives.addOneLife();
    }
}

module.exports = SheriffCard;
