const Distance = require("../models/Distance");
const Player = require("../models/Player");
const DistanceError = require("../Errors/DistanceError");

class DistanceHandler {
    #distances = [];

    /**
     * Добавить новую дистанцию между двумя игроками.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @param {number} distance - Дистанция между игроками.
     * @throws {DistanceError} Если параметры недействительны.
     */
    addDistance(player1, player2, distance) {
        if (!(player1 instanceof Player) || !(player2 instanceof Player)) {
            throw new DistanceError("player1 и player2 должны быть экземплярами Player.");
        }
        if (this.findDistance(player1, player2)) {
            throw new DistanceError("Дистанция между этими игроками уже существует.");
        }
        const newDistance = new Distance(player1, player2, distance);
        this.#distances.push(newDistance);
    }

    /**
     * Найти дистанцию между двумя игроками.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @returns {Distance|null} Объект Distance или null, если не найдено.
     */
    findDistance(player1, player2) {
        return (
            this.#distances.find(
                (d) =>
                    (d.player1 === player1 && d.player2 === player2) ||
                    (d.player1 === player2 && d.player2 === player1)
            ) || null
        );
    }

    /**
     * Получить дистанцию как число между двумя игроками.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @returns {number|null} Дистанция между игроками или null, если не найдена.
     */
    getDistanceValue(player1, player2) {
        const distanceObj = this.findDistance(player1, player2);
        if (distanceObj) {
            return distanceObj.distance;
        }
        return null;
    }

    /**
     * Проверить, является ли дистанция между двумя игроками больше или равной указанному числу.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @param {number} value - Число для сравнения.
     * @returns {boolean} Возвращает true, если дистанция больше или равна указанному числу.
     * @throws {DistanceError} Если дистанция не найдена.
     */
    isDistanceGreaterThanOrEqual(player1, player2, value) {
        const distance = this.getDistanceValue(player1, player2);
        if (distance === null) {
            throw new DistanceError("Дистанция между этими игроками не найдена.");
        }
        return distance >= value;
    }

    /**
     * Проверить, является ли дистанция между двумя игроками меньше указанного числа.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @param {number} value - Число для сравнения.
     * @returns {boolean} Возвращает true, если дистанция меньше указанного числа.
     * @throws {DistanceError} Если дистанция не найдена.
     */
    isDistanceLessThan(player1, player2, value) {
        const distance = this.getDistanceValue(player1, player2);
        if (distance === null) {
            throw new DistanceError("Дистанция между этими игроками не найдена.");
        }
        return distance < value;
    }

    /**
     * Обновить дистанцию между двумя игроками.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @param {number} newDistance - Новая дистанция.
     * @throws {DistanceError} Если дистанция не найдена или параметры недействительны.
     */
    updateDistance(player1, player2, newDistance) {
        const distanceObj = this.findDistance(player1, player2);
        if (!distanceObj) {
            throw new DistanceError("Дистанция между этими игроками не найдена.");
        }
        distanceObj.distance = newDistance;
    }

    /**
     * Удалить дистанцию между двумя игроками.
     * @param {Player} player1 - Первый игрок.
     * @param {Player} player2 - Второй игрок.
     * @throws {DistanceError} Если дистанция не найдена.
     */
    removeDistance(player1, player2) {
        const index = this.#distances.findIndex(
            (d) =>
                (d.player1 === player1 && d.player2 === player2) ||
                (d.player1 === player2 && d.player2 === player1)
        );
        if (index === -1) {
            throw new DistanceError("Дистанция между этими игроками не найдена.");
        }
        this.#distances.splice(index, 1);
    }

    /**
     * Получить все дистанции, связанные с определенным игроком.
     * @param {Player} player - Игрок.
     * @returns {Distance[]} Массив объектов Distance.
     */
    getDistancesForPlayer(player) {
        if (!(player instanceof Player)) {
            throw new DistanceError("player должен быть экземпляром Player.");
        }
        return this.#distances.filter((d) => d.player1 === player || d.player2 === player);
    }

    /**
     * Получить текущую коллекцию дистанций.
     * @returns {Distance[]} Массив объектов Distance.
     */
    getAllDistances() {
        return [...this.#distances];
    }

    /**
     * Очистить все дистанции.
     */
    clearDistances() {
        this.#distances = [];
    }
}

module.exports = DistanceHandler;
