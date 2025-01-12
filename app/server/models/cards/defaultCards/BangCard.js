const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const DefaultCard = require("../DefaultCard");
const PlayerCollection = require("../../../handlers/PlayerCollection");
const DistanceHandler = require("../../../handlers/DistanceHandler");
const Player = require("../../Player");
const WeaponCard = require("../WeaponCard");
const CardInteractionError = require("../../../Errors/CardInteractionError");
const PlayerInteractionError = require("../../../Errors/PlayerInteractionError");

class BangCard extends DefaultCard {
    _damage = 1;

    constructor({ rank, suit, ownerName = "", targetName = "" }) {
        super({
            name: "BANG",
            image: "../resources/imgs/cards/defaultCards/01_bang.png",
            ownerName: ownerName,
            targetName: targetName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new BangCard(data?.rang ?? "", data?.ownerName ?? "", data?.targetName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action({ players }) {
        const ownerPlayer = players.getPlayerByName(this.ownerName);
        const targetPlayer = players.getPlayerByName(this.targetName);

        if (!(ownerPlayer instanceof Player)) {
            throw new CardError("Не известно кто походил карту");
        }

        if (!(targetPlayer instanceof Player)) {
            throw new CardInteractionError(
                `Игрок ${this.ownerName}, походил карту ${this.name}, но не выбрал цель.`,
                this
            );
        }

        try {
            targetPlayer.takeDamageFromPlayer(
                ownerPlayer,
                this.damage,
                new DistanceHandler(players)
            );
        } catch (error) {
            throw new CardInteractionError(error.message, this);
        }
    }
}

module.exports = BangCard;
