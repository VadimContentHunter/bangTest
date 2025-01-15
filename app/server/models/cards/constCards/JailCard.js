const CardError = require("../../../Errors/CardError");
const CardInteractionError = require("../../../Errors/CardInteractionError");
const { aCard, CardType, CardSuit, CardRank } = require("../../../interfaces/aCard");
const GameTable = require("../../GameTable");
const Player = require("../../Player");
const SelectionCards = require("../../SelectionCards");
const ConstantCard = require("../ConstantCard");

class JailCard extends ConstantCard {
    /**
     * @type {Player|null}
     * @private
     */
    #targetPlayer = null;

    /**
     * Сохраняем привязанный обработчик
     */
    boundHandler = null;

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
            name: "Тюрьма",
            image: "../resources/imgs/cards/constCards/01_prigione.png",
            type: CardType.CONST,
            ownerName: ownerName,
            suit: suit,
            rank: rank,
        });
    }

    static initFromJSON(data) {
        return new JailCard({
            ownerName: data?.ownerName ?? "",
            suit: data.suit ?? CardSuit.NONE,
            rank: data.rank ?? CardRank.NONE,
        });
    }

    getActionCallCount() {
        return 0;
    }

    /**
     * Если вернуть false урон не будет нанесен игроку
     *
     * @param {Object} params - Параметры события.
     * @param {Player} player - Игрок, который начинает ход.
     * @param {Array<Player>} playerCollection - Коллекция игроков в текущей игре.
     * @param {Object} gameTable - Стол игры с текущим состоянием.
     *
     * @returns {*} Если Возвращает false - пропуск хода для текущего игрока.
     */
    handler({ player, playerCollection, gameTable }) {
        if (!(this.#targetPlayer instanceof Player)) {
            throw new TypeError("this.#targetPlayer должен быть экземпляром Player");
        }

        if (!(gameTable instanceof GameTable)) {
            throw new TypeError("gameTable должен быть экземпляром GameTable");
        }

        if (!(player instanceof Player)) {
            throw new TypeError("player должен быть экземпляром Player");
        }

        if(player !== this.#targetPlayer){
            return;
        }

        let showCard = gameTable.showRandomsCards(1)[0] ?? null;
        if (showCard === null) {
            throw new CardInteractionError("Не удалось вытащить карту для проверки");
        }

        const selectionCards = new SelectionCards({
            title: `Событие карты ${this.name}`,
            description: `1) Если вытянули карту масти "Черва", сбросьте карту ${this.name} и продолжите ход.
                    <br>2) если вытянули другую карту, сбросьте карту ${this.name} и пропустите ход`,
            textExtension: `Игрок <i>${
                this.#targetPlayer?.name || "неизвестный"
            }</i> вытянул карту: 
            (<i>${showCard.name}</i>,<i>${showCard.suit}</i>,<i>${showCard.rank}</i>)`,
            collectionCards: [showCard],
            selectionCount: 0,
            isWaitingForResponse: false,
        });

        if (showCard.suit != CardSuit.HEARTS) {
            console.log(
                `У игрока ${this.#targetPlayer?.name} сработала ${
                    this.name
                }. Игрок вытянул карту: ${showCard.name}, ${showCard.suit}. Он пропускает ход.`
            );

            selectionCards.textExtension += `<br>Игрок <i>${
                this.#targetPlayer?.name
            }</i> Пропускает ход.`;
            /**
             * Событие, которое вызывает отображение карт.
             * @event GameTable#showCards
             * @type {Object}
             * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
             * @property {SelectionCards} selectionCards - Объект выбора карт.
             */
            this.#targetPlayer.events.emit("showCards", {
                selectionCards: selectionCards,
            });

            gameTable.discardCards([this.#targetPlayer.temporaryCards.pullCardById(this.id)]);
            return false;
        } else {
            console.log(
                `У игрока ${this.#targetPlayer?.name} сработала ${
                    this.name
                }. Игрок вытянул карту: ${showCard.name}, ${
                    showCard.suit
                }. Он продолжает ход, как обычно.`
            );

            selectionCards.textExtension += `<br>Игрок <i>${
                this.#targetPlayer?.name
            }</i> Продолжает ход, как обычно.`;
            /**
             * Событие, которое вызывает отображение карт.
             * @event GameTable#showCards
             * @type {Object}
             * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
             * @property {SelectionCards} selectionCards - Объект выбора карт.
             */
            this.#targetPlayer.events.emit("showCards", {
                selectionCards: selectionCards,
            });

            gameTable.discardCards([this.#targetPlayer.temporaryCards.pullCardById(this.id)]);
        }
    }

    removeEventListener() {
        if (this.#targetPlayer?.events && this.boundHandler !== null) {
            this.#targetPlayer.events.off("beforePlayerMove", this.boundHandler);
            this.boundHandler = null; // Убираем ссылку для предотвращения повторного использования
        }
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

        if (targetPlayer === ownerPlayer) {
            throw new CardInteractionError(
                `Игрок ${this.ownerName}, походил карту ${this.name}, но нельзя выбрать себя целью.`,
                this
            );
        }

        this.#targetPlayer = targetPlayer;
        this.boundHandler = this.handler.bind(this);

        if (ownerPlayer.temporaryCards.hasCardById(this.id)) {
            this.#targetPlayer.temporaryCards.addCard(
                ownerPlayer.temporaryCards.pullCardById(this.id)
            );
        }

        /**
         * @listens Player#beforePlayerMove
         *
         * @param {Object} params - Параметры события.
         * @property {Player} player - Игрок, который начинает ход.
         * @property {Array<Player>} playerCollection - Коллекция игроков в текущей игре.
         * @property {Object} gameTable - Стол игры с текущим состоянием.
         *
         * @returns {*} Если Возвращает false - пропуск хода для текущего игрока.
         */
        this.#targetPlayer.events.on("beforePlayerMove", this.boundHandler);
    }

    destroy() {
        this.removeEventListener();
        this.#targetPlayer = null;
    }
}

module.exports = JailCard;
