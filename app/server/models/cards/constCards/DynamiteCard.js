const CardError = require("../../../Errors/CardError");
const CardInteractionError = require("../../../Errors/CardInteractionError");
const PlayerCollection = require("../../../handlers/PlayerCollection");
const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const GameTable = require("../../GameTable");
const Player = require("../../Player");
const SelectionCards = require("../../SelectionCards");
const ConstantCard = require("../ConstantCard");

class DynamiteCard extends ConstantCard {
    /**
     * @type {Player|null}
     * @private
     */
    #ownerPlayer = null;

    static actionCallCount = 0;

    boundHandler = null; // Сохраняем привязанный обработчик

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

    /**
     * @param {Player} player - Игрок, который берет карты.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @param {GameTable} gameTable - Игровая таблица.
     */
    handler({ player, playerCollection, gameTable }) {
        if (!(playerCollection instanceof PlayerCollection)) {
            throw new TypeError("playerCollection должен быть экземпляром PlayerCollection");
        }

        if (!(this.#ownerPlayer instanceof Player) || !(player instanceof Player)) {
            throw new TypeError("this.#ownerPlayer и player должны быть экземпляром Player");
        }

        if (!(gameTable instanceof GameTable)) {
            throw new TypeError("gameTable должен быть экземпляром GameTable");
        }

        if (this.#ownerPlayer !== player) {
            return;
        }

        let showCard = gameTable.showRandomsCards(1)[0] ?? null;
        const nextPlayer = playerCollection.getNextPlayer(this.#ownerPlayer.id, true);
        const selectionCards = new SelectionCards({
            title: `Событие карты ${this.name}`,
            description: `1) Если вытянули пику от двойки до девятки включительно,
                    «Динамит» взрывается: сбросьте его карту и потеряйте три единицы здоровья;
                    <br>2) если вытянули другую карту, передайте «Динамит» соседу слева: 
                    в начале своего хода он будет делать такую же проверку`,
            textExtension: `Игрок <i>${this.#ownerPlayer?.name || "неизвестный"}</i> вытянул карту: 
            (<i>${showCard.name}</i>,<i>${showCard.suit}</i>,<i>${showCard.rank}</i>)`,
            collectionCards: [showCard],
            selectionCount: 0,
            isWaitingForResponse: false,
        });

        console.log(
            `У игрока ${this.#ownerPlayer?.name} сработал Динамит. Игрок вытянул карту: ${
                showCard.name
            }, ${showCard.suit}, ${showCard.rank}.`
        );

        DynamiteCard.actionCallCount =
            DynamiteCard.actionCallCount > 0 ? DynamiteCard.actionCallCount - 1 : 0;

        if (
            CardRank.isRankInRange(showCard.rank, CardRank.TWO, CardRank.NINE) &&
            showCard.suit === CardSuit.SPADES
        ) {
            selectionCards.textExtension += `<br>У игрока <i>${
                this.#ownerPlayer?.name
            }</i> Взорвался Динамит и получает <i>урон -${this.damage}</i>.`;
            console.log(
                `У игрока ${this.#ownerPlayer?.name} Взорвался Динамит и получает урон -${
                    this.damage
                }.`
            );
            /**
             * Событие, которое вызывает отображение карт.
             * @event GameTable#showCards
             * @type {Object}
             * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
             * @property {SelectionCards} selectionCards - Объект выбора карт.
             */
            this.#ownerPlayer.events.emit("showCards", {
                selectionCards: selectionCards,
            });

            this.#ownerPlayer.lives.removeLives(3);
            gameTable.discardCards([this.#ownerPlayer.temporaryCards.pullCardById(this.id)]);
        } else {
            if (!nextPlayer.temporaryCards.hasCardByName(this.name)) {
                selectionCards.textExtension += `<br>Карта будет передана игроку <i>${
                    nextPlayer?.name || "неизвестный"
                }</i>`;

                /**
                 * Событие, которое вызывает отображение карт.
                 * @event GameTable#showCards
                 * @type {Object}
                 * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
                 * @property {SelectionCards} selectionCards - Объект выбора карт.
                 */
                this.#ownerPlayer.events.emit("showCards", {
                    selectionCards: selectionCards,
                });

                const cardToTransfer = this.#ownerPlayer.transferTempCardToPlayerTemp({
                    targetPlayer: playerCollection.getNextPlayer(this.#ownerPlayer.id, true),
                    cardId: this.id,
                });
                cardToTransfer.action({ players: playerCollection });
            } else {
                throw new CardError(
                    `Игроку ${this.#ownerPlayer?.name} не удалось передать карту Динамит,
                     соседу слева ${nextPlayer?.name}: у него уже есть карта с таким же Названием.`
                );
            }
        }
    }

    removeEventListener() {
        if (this.#ownerPlayer?.events && this.boundHandler !== null) {
            this.#ownerPlayer.events.off("beforeDrawCards", this.boundHandler);
            this.boundHandler = null; // Убираем ссылку для предотвращения повторного использования
        }
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

        if (DynamiteCard.actionCallCount > 0) {
            throw new CardInteractionError("Динамит в игре может быть только один.", this);
        }
        DynamiteCard.actionCallCount++;

        this.#ownerPlayer = ownerPlayer;
        this.boundHandler = this.handler.bind(this);
        this.#ownerPlayer.events.on("beforeDrawCards", this.boundHandler);
    }

    destroy() {
        this.removeEventListener();
        this.#ownerPlayer = null;
    }
}

module.exports = DynamiteCard;
