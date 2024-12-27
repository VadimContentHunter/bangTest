const ValidatePlayerError = require("../../../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../../../interfaces/aCard");
const Player = require("../../../models/Player");
const PlayerCollection = require("../PlayerCollection");
const iFilters = require("./iFilters");

/**
 * Класс для фильтрации игроков по ролям.
 * @extends iFilters
 */
class FilterCharacter extends iFilters {
    /**
     * @type {PlayerCollection|null} Хранилище коллекции игроков.
     * @private
     */
    _playerCollection = null;

    /**
     * Создает экземпляр FilterCharacter.
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
     * Инициализирует экземпляр FilterCharacter.
     * @param {PlayerCollection} playerCollection - Коллекция игроков.
     * @returns {FilterCharacter} Новый экземпляр FilterCharacter.
     * @throws {ValidatePlayerError} Если переданный аргумент не является экземпляром PlayerCollection.
     */
    static init(playerCollection) {
        const filter = new FilterCharacter(playerCollection);
        return filter;
    }

    /**
     * Возвращает игрока без персонажа или с картой, указанной в параметре cardsClass.
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
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
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
     * @returns {Player[]} Массив игроков без персонажа или с картой из cardsClass.
     */
    getPlayersWithoutCharacter(cardsClass = []) {
        return this.playerCollection.getPlayers().filter((player) => {
            return (
                !(player.character instanceof aCard) || // Персонаж отсутствует
                player.character.type !== CardType.CHARACTER || // Некорректный тип карты персонажа
                cardsClass.some((cardClass) => player.character.constructor.name === cardClass.name) // Персонаж в списке исключений
            );
        });
    }

    /**
     * Возвращает игрока с минимальным id среди всех игроков без персонажа
     * или персонаж находится в списке исключений, игнорируя указанные id.
     *
     * Этот метод использует метод `getPlayersWithoutCharacter` для получения списка игроков без персонажа
     * или с картой из `cardsClass`, а затем использует метод `getPlayerWithMinId` для нахождения игрока
     * с минимальным id среди этих игроков.
     *
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
     * @param {Array<number>} [ignoredIds=[]] - Массив id игроков, которых нужно игнорировать.
     * @returns {Player|null} Игрок с минимальным id среди тех, кто без персонажа или с картой из cardsClass,
     * или null, если таких игроков нет.
     */
    getPlayerWithMinIdWithoutCharacter(cardsClass = [], ignoredIds = []) {
        // Получаем всех игроков без персонажа или с картой из cardsClass
        const playersWithoutCharacter = this.getPlayersWithoutCharacter(cardsClass);

        // Используем getPlayerWithMinId для поиска игрока с минимальным id среди отфильтрованных игроков
        return PlayerCollection.findPlayerWithMinIdExcludingIgnored(
            ignoredIds,
            playersWithoutCharacter
        );
    }
}

module.exports = FilterCharacter;