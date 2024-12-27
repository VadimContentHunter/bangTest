const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../../../interfaces/aCard");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");
const iFilters = require("./iFilters");

/**
 * Класс для фильтрации игроков по ролям.
 * @extends iFilters
 */
class RoleFilter extends iFilters {
    /**
     * @type {PlayerCollection|null} Хранилище коллекции игроков.
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр RoleFilter.
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
     * Инициализирует экземпляр RoleFilter.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @returns {RoleFilter} Новый экземпляр RoleFilter.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    static init(playerCollection) {
        const filter = new RoleFilter(playerCollection);
        return filter;
    }

    /**
     * Возвращает игрока с указанной ролью.
     * @param {string} roleType - Тип роли, которую нужно найти (например, CardType.ROLE).
     * @returns {Player|null} Первый игрок с указанной ролью или null, если таких игроков нет.
     */
    getPlayerWithRole(roleType) {
        return (
            this.playerCollection.getPlayers().find((player) => {
                return (
                    player.role && // У игрока должна быть роль
                    player.role.type === roleType // Тип роли должен совпадать с указанным
                );
            }) || null
        );
    }

    /**
     * Возвращает игрока без роли или с картой, указанной в параметре cardsClass.
     * @param {Array<aCard>} cardsClass - Массив классов карт, которые считаются как "отсутствие роли".
     * @returns {Player|null} Первый игрок без роли или с картой из cardsClass, или null, если таких игроков нет.
     */
    getPlayerWithoutRole(cardsClass = []) {
        return (
            this.playerCollection.getPlayers().find((player) => {
                return (
                    !(player.role instanceof aCard) || // Роль отсутствует
                    player.role.type !== CardType.ROLE || // Некорректный тип карты роли
                    cardsClass.some((cardClass) => player.role.constructor.name === cardClass.name) // Роль в списке исключений
                );
            }) || null
        );
    }

    /**
     * Находит игрока с минимальным id среди тех, у которых отсутствует роль
     * или роль находится в списке исключений, игнорируя указанные id.
     *
     * Этот метод комбинирует логику методов `getPlayersWithoutRole` и `getPlayerWithMinId`.
     *
     * @param {Array<aCard>} cardsClass - Массив классов карт, которые считаются как "отсутствие роли".
     * @param {Array<number>} [ignoredIds=[]] - Массив id игроков, которых нужно игнорировать.
     * @returns {Object|null} Игрок с минимальным id, или null, если подходящий игрок не найден.
     */
    // getPlayerWithMinIdWithoutRole(cardsClass = [], ignoredIds = []) {
    //     // Используем метод getPlayersWithoutRole для получения списка игроков без роли
    //     const playersWithoutRole = this.getPlayersWithoutRole(cardsClass);

    //     // Теперь используем метод getPlayerWithMinId для поиска игрока с минимальным id среди игроков без роли
    //     return PlayerCollection.findPlayerWithMinIdExcludingIgnored(ignoredIds, playersWithoutRole);
    // }

    /**
     * Возвращает игроков с указанной ролью в виде коллекции PlayerCollection.
     * @param {string} roleType - Тип роли, которую нужно найти (например, CardType.ROLE).
     * @returns {PlayerCollection} Коллекция игроков с указанной ролью.
     */
    getPlayersWithRole(roleType) {
        const playersWithRole = this.playerCollection.getPlayers().filter((player) => {
            return (
                player.role && // У игрока должна быть роль
                player.role.type === roleType // Тип роли должен совпадать с указанным
            );
        });
        const playerCollection = new PlayerCollection();
        playersWithRole.forEach((player) => playerCollection.addPlayerFromInstance(player)); // Добавляем игроков в коллекцию
        return playerCollection;
    }

    /**
     * Возвращает всех игроков без роли или с картой, указанной в параметре cardsClass, в виде коллекции PlayerCollection.
     * @param {Array<aCard>} cardsClass - Массив классов карт, которые считаются как "отсутствие роли".
     * @returns {PlayerCollection} Коллекция игроков без роли или с картой из cardsClass.
     */
    getPlayersWithoutRole(cardsClass = []) {
        const playersWithoutRole = this.playerCollection.getPlayers().filter((player) => {
            return (
                !(player.role instanceof aCard) || // Роль отсутствует
                player.role.type !== CardType.ROLE || // Некорректный тип карты роли
                cardsClass.some((cardClass) => player.role.constructor.name === cardClass.name) // Роль в списке исключений
            );
        });
        const playerCollection = new PlayerCollection();
        playersWithoutRole.forEach((player) => playerCollection.addPlayerFromInstance(player)); // Добавляем игроков в коллекцию
        return playerCollection;
    }
}

module.exports = RoleFilter;
