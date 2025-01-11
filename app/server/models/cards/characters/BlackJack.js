const { aCard, CardType, CardSuit } = require("../../../interfaces/aCard");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");
const GameTable = require("../../../models/GameTable");
const Player = require("../../../models/Player");
const SelectionCards = require("../../../models/SelectionCards");

/**
 * Класс BlackJack представляет карту типа Character в игре.
 * @extends aCard
 */
class BlackJack extends aCard {
    /**
     * Создаёт новый объект BlackJack.
     * @param {string} ownerName - Имя владельца карты.
     */
    constructor(ownerName = "") {
        super({
            name: "Black Jack",
            image: "../resources/imgs/cards/characters/01_blackjack.png",
            type: CardType.CHARACTER,
            ownerName: ownerName,
            targetName: "",
        });
    }

    /**
     * Инициализирует объект BlackJack из JSON-данных.
     * @param {Object} data - Данные карты в формате JSON.
     * @param {PLayer|null} [data.player=null] - Количество жизней.
     * @param {GameTable|null} [data.gameTable=null] - Игровая таблица.
     * @param {string} data.ownerName - Имя владельца карты.
     * @returns {BlackJack} Новый объект BlackJack.
     */
    static initFromJSON(data) {
        return new BlackJack(data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    /**
     * Метод действия карты BlackJack.
     * @listens GameTable#cardDrawn Обрабатывает событие "cardDrawn", которое вызывается, когда карты были взяты из основной колоды.
     * @throws {CardError} Если переданы некорректные значения для параметров.
     */
    action({ player, gameTable }) {
        if (gameTable instanceof GameTable && player instanceof Player) {
            /**
             * Обрабатывает событие "cardDrawn", которое вызывается, когда карты были взяты из основной колоды.
             *
             * @listens GameTable#cardDrawn
             * @param {Object} param0 - Объект, содержащий данные о взятых картах.
             * @param {Array<aCard>} param0.drawnCards - Массив карт, которые были взяты из основной колоды.
             * @param {Player|null} param0.drawingPlayer  - Игрок, который взял карты, или null, если игрок не указан.
             * @throws {CardError} Если переданы некорректные данные для параметров.
             */
            player.events.on("cardDrawn", ({ drawnCards, drawingPlayer = null }) => {
                // Проверка, что drawnCards — это массив объектов типа aCard
                if (!Array.isArray(drawnCards)) {
                    throw new CardError("BlackJack: drawnCards должно быть массивом.");
                }

                if (drawingPlayer instanceof Player && drawingPlayer.name !== player.name) {
                    return;
                }

                let drawCount = 0;
                drawnCards.forEach((card, index) => {
                    if (!(card instanceof aCard)) {
                        throw new CardError(
                            "BlackJack: каждый элемент в drawnCards должен быть экземпляром aCard."
                        );
                    }

                    if (
                        index % 2 === 1 &&
                        (card.suit === CardSuit.HEARTS || card.suit === CardSuit.DIAMONDS)
                    ) {
                        drawCount++;

                        console.log(
                            `BlackJack: игрок ${
                                player?.name || "неизвестный"
                            } берет еще одну карту`
                        );

                        const selectionCards = new SelectionCards({
                            title: `Событие персонажа ${this.name}`,
                            description: "Если карта масти 'Черва' или 'Бубна', игрок берет карту",
                            textExtension: `Игрок <i>${
                                player?.name || "неизвестный"
                            }</i> вытянул эту карту . . .`,
                            collectionCards: [card],
                            selectionCount: 0,
                            isWaitingForResponse: false,
                        });

                        /**
                         * Событие, которое вызывает отображение карт.
                         * @event GameTable#showCards
                         * @type {Object}
                         * @property {Array<aCard>} cards - Массив карт, которые необходимо показать.
                         * @property {SelectionCards} selectionCards - Объект выбора карт.
                         */
                        player.events.emit("showCards", { selectionCards });
                    }
                });

                player.drawFromDeck(gameTable, drawCount, true);
                // this.gameTable.drawCardsForPlayer(player, drawCount, true);
            });
        } else {
            throw new CardError("BlackJack: Некорректный объект GameTable.");
        }
    }
}

module.exports = BlackJack;
