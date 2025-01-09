const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const DefaultCard = require("../DefaultCard");
const PlayerCollection = require("../../../handlers/PlayerCollection");

class BangCard extends DefaultCard {
    #collectionPlayers = null;

    constructor(rang, ownerName = "", targetName = "") {
        super({
            name: "BANG",
            image: "../resources/imgs/cards/defaultCards/01_bang.png",
            type: CardType.DEFAULT,
            ownerName: ownerName,
            targetName: targetName,
            rang: rang,
        });
    }

    /**
     * @returns {CardsCollection|null}
     */
    get collectionPlayers() {
        return this.#collectionPlayers;
    }

    /**
     * @param {CardsCollection|null} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set collectionPlayers(value) {
        if (!(value instanceof PlayerCollection) && value !== null) {
            throw new CardError("collectionPlayers должен быть экземпляром PlayerCollection.");
        }
        this.#collectionPlayers = value;
    }

    static initFromJSON(data) {
        return new BangCard(data?.rang ?? "", data?.ownerName ?? "", data?.targetName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {
        
    }
}

module.exports = BangCard;
