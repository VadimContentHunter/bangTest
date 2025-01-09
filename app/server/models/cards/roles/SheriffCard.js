const { aCard, CardType } = require("../../../interfaces/aCard");
const Lives = require("../../Lives");
const CardError = require("../../../Errors/CardError");

class SheriffCard extends aCard {
    #lives = null;

    constructor(lives = null, ownerName = "") {
        super({
            name: "Шериф",
            image: "../resources/imgs/cards/roles/01_sceriffo.png",
            type: CardType.ROLE,
            ownerName: ownerName,
        });

        this.lives = lives; // Используем сеттер для установки значения
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
                "SheriffCard: Invalid lives provided. Must be an instance of Lives or null."
            );
        }
    }

    static initFromJSON(data) {
        return new SheriffCard(data?.lives ?? null, data?.ownerName ?? "");
    }

    getActionCallCount() {
        return 0;
    }

    action() {
        this.lives.addOneLife();
    }
}

module.exports = SheriffCard;
