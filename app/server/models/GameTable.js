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
            throw new ValidatePlayerError("events must be an instance of EventEmitter or null.");
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
        // if (this.#timer === null) {
        //     throw new GameTableError("timer не инициализирован.");
        // }
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
     * @param {Array<aCard>} cards - Массив карт.
     * @throws {GameTableError} Если переданы некорректные параметры.
     */
    addPlayerOneCard(player, card) {
        if (!(player instanceof Player)) {
            throw new GameTableError("Игрок не наследуется от класса Player.");
        }

        if (!(card instanceof aCard)) {
            throw new GameTableError("Все элементы массива cards должны быть экземплярами aCard.");
        }
        card.ownerName = player.name;
        this.playedCards.addCard(card, false);
    }

    getDataSummary() {
        return {
            countDeckMain: this.deckMain.countCards(),
            countDiscardDeck: this.discardDeck.countCards(),
            timer: this.timer,
            collectionCards: this.playedCards.getAllCards(),
        };
    }

    /**
     * Берет карты из основной колоды и добавляет их в указанную коллекцию или возвращает.
     * Если карт недостаточно в основной колоде, они перетасовываются из колоды сброса.
     * @param {number} count - Количество карт для взятия.
     * @param {CardsCollection|null} collectionCards - Коллекция карт для добавления. Если null, возвращает массив карт.
     * @returns {Array|void} Массив карт, если collectionCards не передан.
     */
    drawCardFromMainDeck(count, collectionCards = null) {
        // Если карт недостаточно в основной колоде, переносим карты из колоды сброса
        if (this.deckMain.countCards() < count) {
            this.transferDiscardToMainDeck();
        }

        // Проверяем, достаточно ли карт в основной колоде
        if (this.deckMain.countCards() >= count) {
            const drawnCards = this.deckMain.pullRandomCards(count);

            // Если передана коллекция карт, добавляем в нее
            if (collectionCards instanceof CardsCollection) {
                collectionCards.addArrayCards(drawnCards, false);
                return;
            }

            // Если коллекция карт не передана, возвращаем массив карт
            return drawnCards;
        }

        // Возвращаем пустой массив, если карт недостаточно
        return [];
    }

    /**
     * Перемещает карты из указанной коллекции в колоду сброса.
     * @param {CardsCollection} collectionCards - Коллекция карт для сброса.
     * @param {Array} cardIds - Массив ID карт, которые нужно сбросить.
     */
    discardCards(collectionCards, cardIds) {
        const cardsToDiscard = collectionCards.pullCardsByIds(cardIds);
        this.discardDeck.addArrayCards(cardsToDiscard, false);
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
