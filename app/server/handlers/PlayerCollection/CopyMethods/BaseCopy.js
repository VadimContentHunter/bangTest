const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");

/**
 * Класс для копирования данных игроков между объектами игрока и коллекциями игроков.
 */
class BaseCopy {
    /**
     * @type {PlayerCollection|null} Хранилище коллекции игроков.
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр BaseCopy.
     * @param {PlayerCollection} playerCollection - Коллекция игроков, с которой будет работать класс.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    constructor(playerCollection) {
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
     * Копирует указанные свойства из найденного игрока в коллекции для targetPlayer.
     * @param {Player} targetPlayer - Игрок, в который будут скопированы данные.
     * @param {Player|string} playerOrNameCollection - Объект игрока или имя игрока для поиска в коллекции.
     * @param {Array<string>} propertiesToCopy - Массив свойств, которые нужно скопировать.
     * @returns {Player|null} Возвращает объект targetPlayer с скопированными данными или null, если игрок не найден.
     * @throws {TypeError} Если propertiesToCopy не является массивом строк.
     */
    copyPlayerFromPlayerCollection(targetPlayer, playerOrNameCollection, propertiesToCopy) {
        // Проверяем, что targetPlayer является экземпляром Player
        if (!(targetPlayer instanceof Player)) {
            return null;
        }

        // Ищем игрока в коллекции по имени или объекту игрока
        let playerCollection = null;
        if (playerOrNameCollection instanceof Player) {
            playerCollection = this.getPlayerByName(playerOrNameCollection.name);
        } else if (typeof playerOrNameCollection === "string") {
            playerCollection = this.getPlayerByName(playerOrNameCollection);
        }

        // Если игрок не найден, возвращаем null
        if (!(targetPlayer instanceof Player) || !(playerCollection instanceof Player)) {
            return null;
        }

        // Проверяем, что propertiesToCopy является массивом строк
        if (!Array.isArray(propertiesToCopy)) {
            throw new TypeError("propertiesToCopy должен быть массивом строк.");
        }

        // Копируем указанные свойства
        return Player.copyDataPlayer(targetPlayer, playerCollection, propertiesToCopy);
    }

    /**
     * Копирует все данные из текущей коллекции игроков в новую коллекцию.
     * @returns {PlayerCollection} Новая коллекция игроков с копированными данными.
     */
    copyPlayerCollectionFromCollection() {
        // Создаем новую коллекцию игроков
        const copiedCollection = new PlayerCollection(this.useIncrementalId);

        // Копируем каждого игрока из текущей коллекции
        this.players.forEach((player) => {
            const copiedPlayer = Player.copyDataPlayer(player, player);
            if (copiedPlayer instanceof Player) {
                copiedCollection.addPlayerFromInstance(copiedPlayer);
            }
        });

        return copiedCollection;
    }

    /**
     * Создает нового игрока на основе данных из текущей коллекции игроков,
     * копируя указанные свойства из найденного игрока.
     * @param {Player} targetPlayer - Игрок, для которого будет создана копия с новыми свойствами.
     * @param {Player|string} playerOrNameCollection - Объект игрока или имя для поиска в коллекции.
     * @param {Array<string>} propertiesToCopy - Массив свойств для копирования.
     * @returns {Player|null} Новый объект игрока с копированными свойствами или null, если игрок не найден.
     * @throws {TypeError} Если propertiesToCopy не является массивом строк.
     */
    createPlayerFromPlayerCollection(targetPlayer, playerOrNameCollection, propertiesToCopy) {
        // Проверяем, что targetPlayer является экземпляром Player
        if (!(targetPlayer instanceof Player)) {
            return null;
        }

        // Ищем игрока в коллекции по имени или объекту игрока
        let playerCollection = null;
        if (playerOrNameCollection instanceof Player) {
            playerCollection = this.getPlayerByName(playerOrNameCollection.name);
        } else if (typeof playerOrNameCollection === "string") {
            playerCollection = this.getPlayerByName(playerOrNameCollection);
        }

        // Если игрок не найден, возвращаем null
        if (!(targetPlayer instanceof Player) || !(playerCollection instanceof Player)) {
            return null;
        }

        // Проверяем, что propertiesToCopy является массивом строк
        if (!Array.isArray(propertiesToCopy)) {
            throw new TypeError("propertiesToCopy должен быть массивом строк.");
        }

        // Создаем нового игрока с копированными свойствами
        return Player.newMergePlayers(targetPlayer, playerCollection, propertiesToCopy);
    }
}

module.exports = BaseCopy;
