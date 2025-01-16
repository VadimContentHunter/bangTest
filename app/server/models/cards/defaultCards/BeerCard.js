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
const GameTable = require("../../GameTable");
const LivesError = require("../../../Errors/LivesError");

class BeerCard extends DefaultCard {
    _healAmount = 1;

    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({ ownerName = "", suit = CardSuit.SPADES, rank = CardRank.ACE } = {}) {
        super({
            name: "Пиво",
            image: "../resources/imgs/cards/defaultCards/01_birra.png",
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new BeerCard(data?.rang ?? "", data?.ownerName ?? "", data?.targetName ?? "");
    }

    action({ players, cardGameTable }) {
        const ownerPlayer = players.getPlayerByName(this.ownerName);
        if (!(ownerPlayer instanceof Player)) {
            throw new CardError("Не известно кто походил карту");
        }
    
        try {
            ownerPlayer.lives.addLives(this.healAmount, true);
        } catch (error) {
            if (error instanceof LivesError) {
                throw new CardInteractionError(
                    `Игрок ${ownerPlayer.name}, походил карту ${this.name}, но не смог вылечиться так как имеет максимальное здоровье.`,
                    this
                );
            } else {
                throw error;
            }
        }
        
    }

    destroy() {}
}

module.exports = BeerCard;
