const Player = require("./Player"); // Подключение модели Player
const DistanceError = require("../Errors/DistanceError"); // Подключение ошибки для дистанции
const PlayerCollection = require("../handlers/PlayerCollection");

class Distance {
    #player1 = null;
    #player2 = null;
    #distance = 0;

    /**
     * Конструктор класса Distance.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @param {number} distance - Дистанция между игроками.
     * @throws {DistanceError} Если один из игроков не является экземпляром Player, или дистанция некорректна.
     */
    constructor(player1, player2, distance) {
        this.player1 = player1;
        this.player2 = player2;
        this.distance = distance;
    }

    /**
     * Геттер для первого игрока.
     * @returns {Player} Первый игрок.
     */
    get player1() {
        return this.#player1;
    }

    /**
     * Сеттер для первого игрока.
     * @param {Player} value - Установить первого игрока.
     * @throws {DistanceError} Если value не является экземпляром Player.
     */
    set player1(value) {
        if (!(value instanceof Player)) {
            throw new DistanceError("player1 должен быть экземпляром Player.");
        }
        this.#player1 = value;
    }

    /**
     * Геттер для второго игрока.
     * @returns {Player} Второй игрок.
     */
    get player2() {
        return this.#player2;
    }

    /**
     * Сеттер для второго игрока.
     * @param {Player} value - Установить второго игрока.
     * @throws {DistanceError} Если value не является экземпляром Player.
     */
    set player2(value) {
        if (!(value instanceof Player)) {
            throw new DistanceError("player2 должен быть экземпляром Player.");
        }
        this.#player2 = value;
    }

    /**
     * Геттер для дистанции между игроками.
     * @returns {number} Дистанция между игроками.
     */
    get distance() {
        return this.#distance;
    }

    /**
     * Сеттер для дистанции.
     * @param {number} value - Установить дистанцию.
     * @throws {DistanceError} Если distance не является положительным целым числом.
     */
    set distance(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new DistanceError("distance должен быть положительным целым числом.");
        }
        this.#distance = value;
    }

    /**
     * Преобразует объект Distance в JSON-формат.
     * @returns {Object} JSON-представление дистанции, включая имена игроков и дистанцию.
     */
    toJSON() {
        return {
            player1: this.#player1.name,
            player2: this.#player2.name,
            distance: this.#distance,
        };
    }

    /**
     * Статический метод для инициализации объекта Distance из данных JSON.
     * @param {Object|String} inputData - Данные для создания объекта Distance, могут быть строкой или объектом.
     * @param {PlayerCollection} playerCollection - Коллекция игроков для поиска игроков по имени.
     * @returns {Distance} Объект Distance, созданный из переданных данных.
     * @throws {TypeError} Если данные не соответствуют ожидаемому формату.
     */
    static initFromJSON(inputData, playerCollection) {
        try {
            const distanceDataArray =
                typeof inputData === "string" ? JSON.parse(inputData) : inputData;

            if (!Array.isArray(distanceDataArray)) {
                throw new TypeError("Данные должны быть массивом Distance.");
            }

            if (!(playerCollection instanceof PlayerCollection)) {
                throw new TypeError("playerCollection должен быть экземпляром PlayerCollection.");
            }

            return new Distance(
                playerCollection.getPlayerByName(distanceDataArray.player1),
                playerCollection.getPlayerByName(distanceDataArray.player2),
                distanceDataArray.distance
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Distance;
