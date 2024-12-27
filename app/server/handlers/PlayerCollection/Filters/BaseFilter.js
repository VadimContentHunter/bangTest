const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");
const Filters = require("./Filters");

/**
 * Базовый класс для фильтрации игроков.
 * @extends Filters
 */
class BaseFilter extends Filters {
    /**
     * Хранилище коллекции игроков.
     * @type {PlayerCollection|null}
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр BaseFilter.
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
     * Инициализирует экземпляр BaseFilter.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @returns {BaseFilter} Новый экземпляр BaseFilter.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    static init(playerCollection) {
        return new BaseFilter(playerCollection);
    }

    /**
     * Возвращает массив всех игроков, которые являются экземплярами Player.
     * @returns {Player[]} Массив игроков.
     * @throws {ValidatePlayerError} Если коллекция игроков не инициализирована.
     */
    getPlayers() {
        if (!this.playerCollection) {
            throw new ValidatePlayerError("playerCollection is not initialized.");
        }
        return this.playerCollection.players.filter((player) => player instanceof Player);
    }

    /**
     * Собирает данные всех игроков с помощью их метода getSummaryInfo.
     * @returns {Array<Object>} Массив данных всех игроков, полученных из getSummaryInfo.
     * @throws {ValidatePlayerError} Если коллекция игроков не инициализирована.
     */
    getDataSummaryAllPlayers() {
        if (!this.playerCollection) {
            throw new ValidatePlayerError("playerCollection is not initialized.");
        }
        return this.playerCollection.players
            .filter((player) => typeof player.getSummaryInfo === "function")
            .map((player) => player.getSummaryInfo());
    }
}

module.exports = BaseFilter;
