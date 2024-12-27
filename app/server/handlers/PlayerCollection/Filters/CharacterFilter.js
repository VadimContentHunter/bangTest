const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../../../interfaces/aCard");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");
const iFilters = require("./iFilters");

/**
 * Класс для фильтрации игроков по Персонажам.
 * @extends iFilters
 */
class CharacterFilter extends iFilters {
    /**
     * @type {PlayerCollection|null} Хранилище коллекции игроков.
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр CharacterFilter.
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
     * Инициализирует экземпляр CharacterFilter.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @returns {CharacterFilter} Новый экземпляр CharacterFilter.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    static init(playerCollection) {
        const filter = new CharacterFilter(playerCollection);
        return filter;
    }

    /**
     * Возвращает игрока без персонажа или с картой, указанной в параметре cardsClass.
     * @param {Array<aCard>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
     * @returns {Player|null} Первый игрок без персонажа или с картой из cardsClass, или null, если таких игроков нет.
     */
    getPlayerWithoutCharacter(cardsClass = []) {
        return (
            this.playerCollection.getPlayers().find((player) => {
                return (
                    !(player.character instanceof aCard) || // Персонаж отсутствует
                    player.character.type !== CardType.CHARACTER || // Некорректный тип карты персонажа
                    cardsClass.some(
                        (cardClass) => player.character.constructor.name === cardClass.name
                    ) // Персонаж в списке исключений
                );
            }) || null
        );
    }

    /**
     * Возвращает всех игроков без персонажа или с картой, указанной в параметре cardsClass.
     * @param {Array<aCard>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
     * @returns {playerCollection} Массив игроков без персонажа или с картой из cardsClass.
     */
    getPlayersWithoutCharacter(cardsClass = []) {
        const playersWithoutCharacter = this.playerCollection.getPlayers().filter((player) => {
            return (
                !(player.character instanceof aCard) || // Персонаж отсутствует
                player.character.type !== CardType.CHARACTER || // Некорректный тип карты персонажа
                cardsClass.some((cardClass) => player.character.constructor.name === cardClass.name) // Персонаж в списке исключений
            );
        });

        const playerCollection = new PlayerCollection();
        playersWithoutCharacter.forEach((player) => playerCollection.addPlayerFromInstance(player)); // Добавляем игроков в коллекцию
        return playerCollection;
    }
}

module.exports = CharacterFilter;
