const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const DefaultCard = require("../DefaultCard");
const PlayerCollection = require("../../../handlers/PlayerCollection");
const DistanceHandler = require("../../../handlers/DistanceHandler");
const Player = require("../../Player");

class BangCard extends DefaultCard {
    #collectionPlayers = null;
    #playersDistances = null;

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

    /**
     * @returns {PlayerCollection|null}
     */
    get collectionPlayers() {
        return this.#collectionPlayers;
    }

    /**
     * @param {PlayerCollection|null} value - Экземпляр PlayerCollection.
     * @throws {CardError} Если значение не является экземпляром PlayerCollection.
     */
    set collectionPlayers(value) {
        if (!(value instanceof PlayerCollection) && value !== null) {
            throw new CardError("collectionPlayers должен быть экземпляром PlayerCollection.");
        }
        this.#collectionPlayers = value;
    }

    /**
     * @returns {DistanceHandler|null}
     */
    get playersDistances() {
        return this.#playersDistances;
    }

    /**
     * @param {DistanceHandler|null} value - Экземпляр DistanceHandler.
     * @throws {CardError} Если значение не является экземпляром DistanceHandler.
     */
    set playersDistances(value) {
        if (!(value instanceof DistanceHandler) && value !== null) {
            throw new CardError("playersDistances должен быть экземпляром DistanceHandler.");
        }
        this.#playersDistances = value;
    }

    static initFromJSON(data) {
        return new BangCard(data?.rang ?? "", data?.ownerName ?? "", data?.targetName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {
        const ownerPlayer = this.collectionPlayers.getPlayerByName(this.ownerName);
        const targetPlayer = this.collectionPlayers.getPlayerByName(this.targetName);

        if (!(ownerPlayer instanceof Player)) {
            throw new CardError("Не известно кто походил карту");
        }

        if (!(targetPlayer instanceof Player)) {
            throw new CardError(`Игрок ${this.ownerName}, походил карту ${this.name}, но не выбрал цель.`);
        }

        if (!(this.playersDistances instanceof DistanceHandler)) {
            throw new Error(
                `Не удалось найти дистанцию игроков`
            );
        }

        let distanceValue = this.playersDistances.getDistanceValue(ownerPlayer, targetPlayer);
        if (distanceValue === null) {
            throw new Error("Дистанция между этими игроками не найдена.");
        }

        // if(ownerPlayer.weapon instanceof aCard && distanceValue <= ownerPlayer.weapon.)
    }
}

module.exports = BangCard;
