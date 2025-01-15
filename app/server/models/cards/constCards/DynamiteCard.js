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
    #cardPlayer = null;

    /**
     * @type {GameTable|null}
     * @private
     */
    #cardGameTable = null;

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
    handler({ player, playerCollection }) {
        if (!(playerCollection instanceof PlayerCollection)) {
            throw new TypeError("playerCollection должен быть экземпляром PlayerCollection");
        }

        if (!(this.#cardPlayer instanceof Player) || !(player instanceof Player)) {
            throw new TypeError("this.#cardPlayer и player должны быть экземпляром Player");
        }

        if (this.#cardPlayer !== player) {
            return;
        }

        let showCard = this.#cardGameTable.showRandomsCards(1)[0] ?? null;
        const nextPlayer = playerCollection.getNextPlayer(this.#cardPlayer.id, true);
        const selectionCards = new SelectionCards({
            title: `Событие карты ${this.name}`,
            description: `1) Если вытянули пику от двойки до девятки включительно,
                    «Динамит» взрывается: сбросьте его карту и потеряйте три единицы здоровья;
                    <br>2) если вытянули другую карту, передайте «Динамит» соседу слева: 
                    в начале своего хода он будет делать такую же проверку`,
            textExtension: `Игрок <i>${this.#cardPlayer?.name || "неизвестный"}</i> вытянул карту: 
            (<i>${showCard.name}</i>,<i>${showCard.suit}</i>,<i>${showCard.rank}</i>)`,
            collectionCards: [showCard],
            selectionCount: 0,
            isWaitingForResponse: false,
        });

        console.log(
            `У игрока ${this.#cardPlayer?.name} сработал Динамит. Игрок вытянул карту: ${
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
                this.#cardPlayer?.name
            }</i> Взорвался Динамит и получает <i>урон -${this.damage}</i>.`;
            console.log(
                `У игрока ${this.#cardPlayer?.name} Взорвался Динамит и получает урон -${
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
            this.#cardPlayer.events.emit("showCards", {
                selectionCards: selectionCards,
            });

            this.#cardPlayer.lives.removeLives(3);
            this.#cardGameTable.discardCards([
                this.#cardPlayer.temporaryCards.pullCardById(this.id),
            ]);
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
                this.#cardPlayer.events.emit("showCards", {
                    selectionCards: selectionCards,
                });

                this.#cardPlayer.transferTemporaryCardToPlayer(
                    playerCollection.getNextPlayer(this.#cardPlayer.id, true),
                    this.id
                );
            } else {
                throw new CardError(
                    `Игроку ${this.#cardPlayer?.name} не удалось передать карту Динамит,
                     соседу слева ${nextPlayer?.name}: у него уже есть карта с таким же Названием.`
                );
            }
        }
    }

    removeEventListener() {
        if (this.#cardPlayer?.events && this.boundHandler !== null) {
            this.#cardPlayer.events.off("beforeDrawCards", this.boundHandler);
            this.boundHandler = null; // Убираем ссылку для предотвращения повторного использования
        }
    }

    action({ cardPlayer, cardGameTable }) {
        if (DynamiteCard.actionCallCount > 0) {
            throw new CardInteractionError("Динамит в игре может быть только один.", this);
        }
        DynamiteCard.actionCallCount++;

        if (cardPlayer instanceof Player && cardGameTable instanceof GameTable) {
            this.#cardPlayer = cardPlayer;
            this.#cardGameTable = cardGameTable;

            // Сохраняем обработчик
            this.boundHandler = this.handler.bind(this);

            // Подключаем обработчик
            this.#cardPlayer.events.on("beforeDrawCards", this.boundHandler);
        } else {
            throw new TypeError("Переданный объект не является игроком (Player).");
        }
    }

    destroy() {
        this.removeEventListener();
        this.#cardPlayer = null;
        this.#cardGameTable = null;
    }
}

module.exports = DynamiteCard;
