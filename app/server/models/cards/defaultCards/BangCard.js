const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const DefaultCard = require("../DefaultCard");
const PlayerCollection = require("../../../handlers/PlayerCollection");
const DistanceHandler = require("../../../handlers/DistanceHandler");
const Player = require("../../Player");
const WeaponCard = require("../WeaponCard");
const PlayerInteractionError = require("../../../Errors/PlayerInteractionError");

class BangCard extends DefaultCard {
    _collectionPlayers = null;
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

    /**
     * @returns {PlayerCollection|null}
     */
    get collectionPlayers() {
        return this._collectionPlayers;
    }

    /**
     * @param {PlayerCollection|null} value - Экземпляр PlayerCollection.
     * @throws {CardError} Если значение не является экземпляром PlayerCollection.
     */
    set collectionPlayers(value) {
        if (!(value instanceof PlayerCollection) && value !== null) {
            throw new CardError("collectionPlayers должен быть экземпляром PlayerCollection.");
        }
        this._collectionPlayers = value;
    }

    /**
     * @returns {number}
     */
    get damage() {
        return this._damage;
    }

    /**
     * @param {number} value
     * @throws {CardError} Если параметр 'damage' не является положительным целым числом.
     */
    set damage(value) {
        if (!Number.isInteger(value) || value <= 0) {
            throw new CardError("Параметр 'damage' должен быть положительным целым числом.");
        }
        this._damage = value;
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
            throw new CardError(
                `Игрок ${this.ownerName}, походил карту ${this.name}, но не выбрал цель.`
            );
        }

        try {
            targetPlayer.takeDamageFromPlayer(
                ownerPlayer,
                this.damage,
                new DistanceHandler(this.collectionPlayers)
            );
        } catch (error) {
            if (error instanceof PlayerInteractionError) {
                ownerPlayer.events.emit("playerMessage", {
                    message: error.message,
                    initPlayer: ownerPlayer,
                });
            } else {
                throw error;
            }
        }
    }
}

module.exports = BangCard;
