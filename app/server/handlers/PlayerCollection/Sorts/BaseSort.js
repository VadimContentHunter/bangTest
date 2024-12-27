const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");
const Sorts = require("./Sorts");

/**
 * Класс для сортировки игроков.
 * @extends Sorts
 */
class BaseSort extends Sorts {
    /**
     * @type {PlayerCollection|null} Хранилище коллекции игроков.
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр BaseSort.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    constructor(playerCollection) {
        super(); // Вызов конструктора родительского класса
        this.playerCollection = playerCollection; // Используем сеттер для проверки
    }

    /**
     * Возвращает текущую коллекцию игроков.
     * @returns {PlayerCollection|null} Коллекция игроков.
     */
    get playerCollection() {
        return this._playerCollection;
    }

    /**
     * Устанавливает коллекцию игроков.
     * @param {PlayerCollection} value - Коллекция игроков.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    set playerCollection(value) {
        if (!(value instanceof PlayerCollection)) {
            throw new ValidatePlayerError(
                "Invalid playerCollection: must be an instance of PlayerCollection"
            );
        }
        this._playerCollection = value;
    }

    /**
     * Инициализирует экземпляр BaseSort.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @returns {BaseSort} Новый экземпляр BaseSort.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    static init(playerCollection) {
        return new BaseSort(playerCollection);
    }

    /**
     * Возвращает всех игроков, отсортированных по ID от меньшего к большему.
     * @returns {Player[]} Массив игроков, отсортированных по ID от меньшего к большему.
     */
    getPlayersSortedAsc() {
        if (!this.playerCollection) {
            throw new ValidatePlayerError("playerCollection is not initialized.");
        }
        return [...this.playerCollection.players].sort((a, b) => a.id - b.id);
    }

    /**
     * Возвращает всех игроков, отсортированных по ID от большего к меньшему.
     * @returns {Player[]} Массив игроков, отсортированных по ID от большего к меньшему.
     */
    getPlayersSortedDesc() {
        if (!this.playerCollection) {
            throw new ValidatePlayerError("playerCollection is not initialized.");
        }
        return [...this.playerCollection.players].sort((a, b) => b.id - a.id);
    }
}

module.exports = BaseSort;
