const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../../../interfaces/aCard");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");
const Filters = require("./Filters");

/**
 * Класс для фильтрации игроков по ролям.
 * @extends Filters
 */
class IdFilter extends Filters {
    /**
     * @type {PlayerCollection|null} Хранилище коллекции игроков.
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр FilterRole.
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
     * Инициализирует экземпляр FilterRole.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @returns {FilterRole} Новый экземпляр FilterRole.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    static init(playerCollection) {
        const filter = new FilterRole(playerCollection);
        return filter;
    }

    /**
     * Получает игрока по его ID.
     * @param {number} id - ID игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если ID не является числом.
     */
    getPlayerById(id) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }
        return this.playerCollection.getPlayers().find((player) => player.id === id);
    }

    /**
     * Находит игрока с минимальным id, исключая указанные id.
     *
     * Этот метод ищет игрока с минимальным id, при этом игнорируя игроков с id,
     * которые указаны в параметре `ignoredIds`.
     *
     * @param {Array<number>} [ignoredIds=[]] - Массив id игроков, которых нужно игнорировать.
     * @returns {Object|null} Игрок с минимальным id, или null, если подходящий игрок не найден.
     */
    getPlayerWithMinId(ignoredIds = []) {
        return this.playerCollection.getPlayers().reduce((minPlayer, currentPlayer) => {
            // Проверяем, не нужно ли игнорировать текущего игрока
            if (ignoredIds.includes(currentPlayer.id)) {
                return minPlayer; // Пропускаем этого игрока
            }

            // Если текущий игрок имеет меньший id, чем текущий минимальный
            return currentPlayer.id < minPlayer.id ? currentPlayer : minPlayer;
        }, this.players[0] || null); // В случае пустого массива возвращаем null
    }

    /**
     * Метод для нахождения игрока с минимальным ID, исключая указанные ID.
     *
     * @param {Array<number>} [ignoredIds=[]] - Массив ID игроков, которых нужно игнорировать.
     * @returns {Player|null} Игрок с минимальным ID, исключая указанные ID, или null, если подходящий игрок не найден.
     */
    getPlayerWithMinIdExcludingIgnored(ignoredIds = []) {
        return (
            this.playerCollection
                .getPlayers()
                .filter((player) => Number.isInteger(player.id) && !ignoredIds.includes(player.id))
                .reduce(
                    (minPlayer, currentPlayer) =>
                        minPlayer === null || currentPlayer.id < minPlayer.id
                            ? currentPlayer
                            : minPlayer,
                    null
                ) || null
        );
    }
}

module.exports = IdFilter;
