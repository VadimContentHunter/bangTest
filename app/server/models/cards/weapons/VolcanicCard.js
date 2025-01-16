const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const WeaponCard = require("../WeaponCard");
const Player = require("../../Player");

class VolcanicCard extends WeaponCard {
    /**
     * @type {Player|null}
     * @private
     */
    #ownerPlayer = null;

    /**
     * @type {number}
     * @private
     */
    #oldMaxBangCardsTurn = null;

    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({ ownerName = "", suit = CardSuit.NONE, rank = CardRank.NONE } = {}) {
        super({
            name: "Волканик",
            image: "../resources/imgs/cards/weapons/01_volcanic.png",
            distance: 4,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new VolcanicCard({
            ownerName: data?.ownerName ?? "",
        });
    }

    /**
     *
     * @param {object} param0
     * @param {PlayerCollection} param0.players
     */
    action({ players }) {
        const ownerPlayer = players.getPlayerByName(this.ownerName);
        if (!(ownerPlayer instanceof Player)) {
            throw new CardError("Не известно кто походил карту");
        }
        this.#ownerPlayer = ownerPlayer;

        this.#oldMaxBangCardsTurn = this.#ownerPlayer.cardsRules.maxBangCardsTurn;
        this.#ownerPlayer.cardsRules.maxBangCardsTurn = 1000;
    }

    destroy() {
        if (
            Number.isInteger(this.#oldMaxBangCardsTurn) &&
            Number.isInteger(this.#ownerPlayer.cardsRules.maxBangCardsTurn)
        ) {
            this.#ownerPlayer.cardsRules.maxBangCardsTurn = this.#oldMaxBangCardsTurn;
        }
        
        this.#oldMaxBangCardsTurn = null;
        this.#ownerPlayer = null;
    }
}

module.exports = VolcanicCard;
