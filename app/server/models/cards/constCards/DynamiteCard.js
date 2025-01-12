const CardError = require("../../../Errors/CardError");
const PlayerCollection = require("../../../handlers/PlayerCollection");
const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const GameTable = require("../../GameTable");
const Player = require("../../Player");
const SelectionCards = require("../../SelectionCards");
const ConstantCard = require("../ConstantCard");

class DynamiteCard extends ConstantCard {
    _damage = 3;

    /**
     * Конструктор для создания карты.
     * @param {Object} params - Параметры карты.
     * @param {string} [params.ownerName=""] - Имя владельца карты.
     * @param {string} [params.suit=CardSuit.NONE] - масть карты.
     * @param {string} [params.rank=CardRank.NONE] - ранг карты.
     * @throws {TypeError} Если пытаются создать экземпляр абстрактного класса.
     * @throws {CardError} Если не переопределен метод action() или initFromJSON().
     */
    constructor({ ownerName = "", suit = CardSuit.NONE, rank = CardRank.NONE }) {
        super({
            name: "Динамит",
            image: "../resources/imgs/cards/constCards/01_dinamite.png",
            type: CardType.CONST,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new DynamiteCard({
            ownerName: data?.ownerName ?? "",
            suit: data.suit ?? CardSuit.NONE,
            rank: data.rank ?? CardRank.NONE,
        });
    }

    getActionCallCount() {
        return 0;
    }

    action({ player, gameTable }) {
        if (player instanceof Player && gameTable instanceof GameTable) {
            /**
             * Вызывается перед взятием карт игроком.
             *
             * @listens Player#beforeDrawCards
             * @param {Object} params - Параметры события.
             * @param {PlayerCollection} params.playerCollection - Коллекция игроков, участвующих в текущей игре.
             *
             * @fires Player#showCards
             */
            player.events.on("beforeDrawCards", ({ playerCollection }) => {
                if (!(playerCollection instanceof PlayerCollection)) {
                    throw new TypeError(
                        "playerCollection должен быть экземпляром PlayerCollection"
                    );
                }

                let showCard = gameTable.showRandomsCards(1)[0] ?? null;

                /**
                 * Событие, которое вызывает отображение карт.
                 * @event GameTable#showCards
                 * @type {Object}
                 * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
                 * @property {SelectionCards} selectionCards - Объект выбора карт.
                 */
                player.events.emit("showCards", {
                    selectionCards: new SelectionCards({
                        title: `Событие карты ${this.name}`,
                        description: `1) Если вытянули пику от двойки до девятки включительно,
                            «Динамит» взрывается: сбросьте его карту и потеряйте три единицы здоровья;
                            2) если вытянули другую карту, передайте «Динамит» соседу слева: 
                            в начале своего хода он будет делать такую же проверку`,
                        textExtension: `У игрока <i>${
                            player?.name || "неизвестный"
                        }</i> сработала карта (<b><i>${this.name}</i></b>, <b><i>${
                            this.suit
                        }</i></b>, <b><i>${this.rank}</i></b>)`,
                        collectionCards: [showCard],
                        selectionCount: 0,
                        isWaitingForResponse: false,
                    }),
                });

                if (
                    CardRank.isRankInRange(showCard.rank, CardRank.TWO, CardRank.NINE) &&
                    showCard.suit === CardSuit.SPADES
                ) {
                    player.lives.removeLives(3);
                } else {
                    player.transferTemporaryCardToPlayer(
                        playerCollection.getNextPlayer(player.id, true),
                        this.id
                    );
                }
            });
        } else {
            throw new TypeError("Переданный объект не является игроком (Player).");
        }
    }
}

module.exports = DynamiteCard;
