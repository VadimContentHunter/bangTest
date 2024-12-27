/**
 * Абстрактный класс для фильтрации игроков.
 * Имитирует интерфейс с геттерами и сеттерами для playerCollection.
 * @abstract
 */
class Filters {
    /**
     * Получает коллекцию игроков.
     * @returns {PlayerCollection|null} Коллекция игроков.
     * @abstract
     */
    get playerCollection() {
        throw new Error("Метод 'playerCollection' должен быть реализован в наследуемом классе.");
    }

    /**
     * Устанавливает коллекцию игроков.
     * @param {PlayerCollection} value - Коллекция игроков.
     * @throws {Error} Если метод не переопределен в наследуемом классе.
     * @abstract
     */
    set playerCollection(value) {
        throw new Error("Метод 'playerCollection' должен быть реализован в наследуемом классе.");
    }

    /**
     * @param {PlayerCollection} value - Коллекция игроков.
     * @throws {Error} Если метод не переопределен в наследуемом классе.
     * @abstract
     */
    static init(playerCollection) {
        throw new Error("Метод 'init' должен быть реализован в наследуемом классе.");
    }
}

module.exports = Filters;
