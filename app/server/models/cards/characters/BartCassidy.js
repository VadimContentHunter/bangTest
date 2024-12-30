const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");
const CardsCollection = require("../../../handlers/CardsCollection");

class BartCassidy extends aCard {
    #lives = null;
    #mainDeck = null;
    #hand = null;

    constructor(lives = null, mainDeck = null, hand = null, ownerName = "") {
        super({
            name: "Шериф",
            image: "../resources/imgs/cards/roles/01_sceriffo.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });

        this.lives = lives; // Используем сеттер
        this.mainDeck = mainDeck; // Используем сеттер
        this.hand = hand; // Используем сеттер
    }

    /**
     * Геттер для #lives.
     * @returns {Lives|null} Текущее значение жизни.
     */
    get lives() {
        return this.#lives;
    }

    /**
     * Сеттер для #lives.
     * @param {Lives|null} value - Объект Lives или null.
     * @throws {CardError} Если передано некорректное значение.
     */
    set lives(value) {
        if (value === null || value instanceof Lives) {
            this.#lives = value;
        } else {
            throw new CardError(
                "BartCassidy: Invalid lives provided. Must be an instance of Lives or null."
            );
        }
    }

    /**
     * Геттер для #mainDeck.
     * @returns {CardsCollection|null} Текущая колода карт.
     */
    get mainDeck() {
        return this.#mainDeck;
    }

    /**
     * Сеттер для #mainDeck.
     * @param {CardsCollection|null} value - Объект CardsCollection или null.
     * @throws {CardError} Если передано некорректное значение.
     */
    set mainDeck(value) {
        if (value === null || value instanceof CardsCollection) {
            this.#mainDeck = value;
        } else {
            throw new CardError(
                "BartCassidy: Invalid mainDeck provided. Must be an instance of CardsCollection or null."
            );
        }
    }

    /**
     * Геттер для #hand.
     * @returns {CardsCollection|null} Текущая рука игрока.
     */
    get hand() {
        return this.#hand;
    }

    /**
     * Сеттер для #hand.
     * @param {CardsCollection|null} value - Объект CardsCollection или null.
     * @throws {CardError} Если передано некорректное значение.
     */
    set hand(value) {
        if (value === null || value instanceof CardsCollection) {
            this.#hand = value;
        } else {
            throw new CardError(
                "BartCassidy: Invalid hand provided. Must be an instance of CardsCollection or null."
            );
        }
    }

    static initFromJSON(data) {
        return new BartCassidy(
            data?.lives ?? null,
            data?.mainDeck ?? null,
            data?.hand,
            data?.ownerName ?? ""
        );
    }

    action() {
        if (this.lives instanceof Lives) {
            this.lives.on("lifeLost", ({ oldLives, amountLost, remainingLives }) => {
                // Проверка на наличие параметров
                // if (typeof oldLives !== "number" || oldLives < 0) {
                //     throw new CardError("Invalid 'oldLives' parameter:", oldLives);
                // }
                if (typeof amountLost !== "number" || amountLost <= 0) {
                    throw new CardError("Invalid 'amountLost' parameter:", amountLost);
                }
                // if (typeof remainingLives !== "number" || remainingLives < 0) {
                //     throw new CardError("Invalid 'remainingLives' parameter:", remainingLives);
                // }

                if (
                    this.mainDeck instanceof CardsCollection &&
                    this.hand instanceof CardsCollection
                ) {
                    this.hand.addArrayCards(this.mainDeck.pullRandomCards(amountLost));
                }
            });
        } else {
            throw new CardError("BartCassidy: Invalid lives provided");
        }
    }
}

module.exports = BartCassidy;
