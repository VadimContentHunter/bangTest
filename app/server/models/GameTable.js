const Player = require("./Player"); // Подключение модели Player
const GameTableError = require("../Errors/GameTableError"); // Подключение ошибки для дистанции
const CardsCollection = require("../handlers/CardsCollection");
const { aCard } = require("../interfaces/aCard");
const EventEmitter = require("events");

class GameTable {
    /** @type {CardsCollection | null} */
    #deckMain = null;

    /** @type {CardsCollection | null} */
    #discardDeck = null;

    /** @type {number | null} */
    #timer = null;

    /** @type {CardsCollection | null} */
    #playedCards = null;

    /**
     * @type {EventEmitter|null}
     * @private
     */
    #events = null;

    /**
     * Конструктор класса GameTable.
     */
    constructor({ playedCards = null, deckMain = null, discardDeck = null, events = null } = {}) {
        this.deckMain = deckMain ?? new CardsCollection();
        this.discardDeck = discardDeck ?? new CardsCollection();
        this.playedCards = playedCards ?? new CardsCollection();
        this.events = events ?? new EventEmitter();
    }

    // ======== SET методы ========

    /**
     * Сеттер для объекта EventEmitter.
     * @param {EventEmitter|null} value - Новый объект EventEmitter.
     */
    set events(value) {
        if (value !== null && !(value instanceof EventEmitter)) {
            throw new GameTableError("events must be an instance of EventEmitter or null.");
        }
        this.#events = value;
    }

    /**
     * Устанавливает главную колоду (deckMain).
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set deckMain(value) {
        if (!(value instanceof CardsCollection)) {
            throw new GameTableError("deckMain должен быть экземпляром CardsCollection.");
        }
        this.#deckMain = value;
    }

    /**
     * Устанавливает колоду сброса (discardDeck).
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set discardDeck(value) {
        if (!(value instanceof CardsCollection)) {
            throw new GameTableError("discardDeck должен быть экземпляром CardsCollection.");
        }
        this.#discardDeck = value;
    }

    /**
     * Устанавливает таймер.
     * @param {number} value - Целое число, представляющее таймер.
     * @throws {GameTableError} Если значение не является целым числом.
     */
    set timer(value) {
        if (!Number.isInteger(value)) {
            throw new GameTableError("timer должен быть целым числом.");
        }
        this.#timer = value;
    }

    /**
     * Устанавливает карты, сыгранные на стол (playedCards).
     * @param {CardsCollection} value - Экземпляр CardsCollection.
     * @throws {GameTableError} Если значение не является экземпляром CardsCollection.
     */
    set playedCards(value) {
        if (!(value instanceof CardsCollection)) {
            throw new GameTableError("playedCards должен быть экземпляром CardsCollection.");
        }
        this.#playedCards = value;
    }

    // ======== GET методы ========

    /**
     * Геттер для объекта EventEmitter.
     * @returns {EventEmitter|null} Объект EventEmitter.
     */
    get events() {
        return this.#events;
    }

    /**
     * Возвращает главную колоду (deckMain).
     * @returns {CardsCollection} Экземпляр CardsCollection.
     * @throws {GameTableError} Если свойство не установлено.
     */
    get deckMain() {
        if (!this.#deckMain) {
            throw new GameTableError("deckMain не инициализирован.");
        }
        return this.#deckMain;
    }

    /**
     * Возвращает колоду сброса (discardDeck).
     * @returns {CardsCollection} Экземпляр CardsCollection.
     * @throws {GameTableError} Если свойство не установлено.
     */
    get discardDeck() {
        if (!this.#discardDeck) {
            throw new GameTableError("discardDeck не инициализирован.");
        }
        return this.#discardDeck;
    }

    /**
     * Возвращает значение таймера.
     * @returns {number | null} Таймер или null, если не установлен.
     */
    get timer() {
        return this.#timer;
    }

    /**
     * Возвращает карты, сыгранные на стол (playedCards).
     * @returns {CardsCollection|null} Массив карт.
     */
    get playedCards() {
        if (!this.#playedCards) {
            throw new GameTableError("playedCards не инициализирован.");
        }
        return this.#playedCards;
    }

    /**
     * Добавляет карты игрока на стол.
     * @param {Player} player - Экземпляр игрока.
     * @param {Array<aCard>} cards - Массив карт.
     * @throws {GameTableError} Если переданы некорректные параметры.
     */
    addPlayerCards(player, cards) {
        if (!(player instanceof Player)) {
            throw new GameTableError("Игрок не наследуется от класса Player.");
        }

        if (!Array.isArray(cards)) {
            throw new GameTableError("cards должен быть массивом.");
        }

        for (const card of cards) {
            if (!(card instanceof aCard)) {
                throw new GameTableError(
                    "Все элементы массива cards должны быть экземплярами aCard."
                );
            }
        }

        // Присваиваем имя владельца каждой карте и добавляем её в playedCards
        for (const card of cards) {
            this.addPlayerOneCard(player, card);
        }
    }

    /**
     * Добавляет карту игрока на стол.
     * @param {Player} player - Экземпляр игрока.
     * @param {aCard} card - Карта игрока.
     * @throws {GameTableError} Если переданы некорректные параметры.
     */
    addPlayerOneCard(player, card) {
        if (!(player instanceof Player)) {
            throw new GameTableError("Игрок не наследуется от класса Player.");
        }

        if (!(card instanceof aCard)) {
            throw new GameTableError("card должен быть экземпляром aCard.");
        }
        card.ownerName = player.name;
        this.playedCards.addCard(card, false);
    }

    getDataSummary() {
        return {
            countDeckMain: this.deckMain.countCards(),
            countDiscardDeck: this.discardDeck.countCards(),
            timer: this.timer,
            collectionCards: this.playedCards,
        };
    }

    /**
     * Берет карты из основной колоды и добавляет их в коллекцию игрока.
     * Если карт недостаточно в основной колоде, они перетасовываются из колоды сброса.
     * @param {Player} player - Игрок, которому добавляются карты.
     * @param {number} count - Количество карт для взятия.
     * @param {boolean} ignoredEvent - Флаг для игнорирования события, если true, тогда событие игнорируется (по умолчанию false).
     * @throws {TypeError} Если player не является экземпляром класса Player.
     * @fires GameTable#cardDrawn Событие, что карты были взяты из основной колоды.
     */
    drawCardsForPlayer(player, count, ignoredEvent = false) {
        if (!(player instanceof Player)) {
            throw new TypeError("Параметр 'player' должен быть экземпляром класса Player.");
        }

        // Если карт недостаточно в основной колоде, переносим карты из колоды сброса
        if (this.deckMain.countCards() < count) {
            this.transferDiscardToMainDeck();
        }

        // Проверяем, достаточно ли карт в основной колоде
        if (this.deckMain.countCards() >= count) {
            const drawnCards = this.deckMain.pullRandomCards(count);

            // Добавляем карты в руку игрока
            player.hand.addArrayCards(drawnCards, false);

            // Если событие не нужно игнорировать, эмитируем его
            if (!ignoredEvent) {
                /**
                 * Событие, что карты были взяты из основной колоды.
                 * @event GameTable#cardDrawn
                 * @type {Object}
                 * @property {Array<aCard>} drawnCards - Массив карт, которые были взяты из основной колоды.
                 * @property {number} remainingInDeck - Количество оставшихся карт в основной колоде.
                 * @property {Player} drawingPlayer - Игрок, который взял карты.
                 */
                this.events?.emit("cardDrawn", {
                    drawnCards,
                    remainingInDeck: this.deckMain.countCards(),
                    drawingPlayer: player,
                });
            }
        } else {
            // Если карт недостаточно даже после переноса, выбрасываем исключение
            throw new Error("В основной колоде недостаточно карт для выполнения операции.");
        }
    }

    /**
     * Перемещает карты из руки игрока в колоду сброса.
     * @param {Player} player - Игрок, чьи карты нужно сбросить.
     * @param {Array} cardIds - Массив ID карт, которые нужно сбросить.
     * @throws {TypeError} Если player не является экземпляром класса Player.
     * @fires GameTable#cardDiscarded Событие, что карты были сброшены в discardDeck.
     */
    discardPlayerCards(player, cardIds) {
        if (!(player instanceof Player)) {
            throw new TypeError("Параметр 'player' должен быть экземпляром класса Player.");
        }

        // Получаем карты из руки игрока
        const cardsToDiscard = player.hand.pullCardsByIds(cardIds);

        // Добавляем карты в колоду сброса
        this.discardDeck.addArrayCards(cardsToDiscard, false);

        /**
         * Событие, что карты были сброшены в discardDeck.
         * @event GameTable#cardDiscarded
         * @type {Object}
         * @property {Array<aCard>} discardedCards - Массив карт, которые были сброшены в колоду discardDeck.
         * @property {number} remainingInDiscardDeck - Количество оставшихся карт в колоде сброса.
         * @property {Player} discardingPlayer - Игрок, который сбросил карты.
         */
        this.events?.emit("cardDiscarded", {
            discardedCards: cardsToDiscard,
            remainingInDiscardDeck: this.discardDeck.countCards(),
            discardingPlayer: player,
        });
    }

    /**
     * Сбрасывает в колоду все карты находящиеся на столе
     */
    discardAllCardsFromTable() {
        this.discardDeck.addArrayCards(this.playedCards.pullAllCards(), false);
    }

    transferDiscardToMainDeck() {
        if (this.discardDeck.countCards() > 0) {
            this.deckMain.addArrayCards(this.discardDeck.pullAllCards(), false);
        }
    }

    /**
     * Возвращает JSON-представление данных игры
     * @returns {Object} Данные игры в формате JSON.
     */
    getGameData() {
        return {
            deckMainCount: this.deckMain.countCards(),
            discardDeckCount: this.discardDeck.countCards(),
            playedCardsCount: this.playedCards.countCards(),
        };
    }

    /**
     * Возвращает JSON-представление игрового стола.
     * @returns {Object} JSON-объект с информацией о состоянии игрового стола.
     */
    toJSON() {
        return {
            deckMain: this.deckMain,
            discardDeck: this.discardDeck,
            timer: this.timer,
            collectionCards: this.playedCards,
        };
    }

    static initFromJSON(inputData) {
        const procData = typeof inputData === "string" ? JSON.parse(inputData) : inputData;
        return new GameTable({
            playedCards: CardsCollection.initFromJSON(procData.collectionCards, false),
            deckMain:
                procData.deckMain != null
                    ? CardsCollection.initFromJSON(procData.deckMain, false)
                    : null,
            discardDeck:
                procData.deckMain != null
                    ? CardsCollection.initFromJSON(procData.discardDeck, false)
                    : null,
        });
    }
}

module.exports = GameTable;
