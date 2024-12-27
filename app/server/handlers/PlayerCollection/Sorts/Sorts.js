/**
 * Абстрактный класс для сортировки и фильтрации игроков.
 * Обеспечивает интерфейс для работы с коллекцией игроков через геттеры и сеттеры.
 * Данный класс предназначен для наследования, и его методы должны быть переопределены в подклассах.
 * @abstract
 */
class Sorts {
    /**
     * Возвращает коллекцию игроков, с которой будет работать фильтр или сортировка.
     * Должен быть переопределен в подклассах.
     * @returns {PlayerCollection|null} Коллекция игроков, либо null, если коллекция не установлена.
     * @throws {Error} Если метод вызывается в базовом абстрактном классе.
     * @abstract
     */
    get playerCollection() {
        throw new Error("Метод 'playerCollection' должен быть реализован в наследуемом классе.");
    }

    /**
     * Устанавливает коллекцию игроков, с которой будет работать фильтр или сортировка.
     * Должен быть переопределен в подклассах.
     * @param {PlayerCollection} value - Коллекция игроков для обработки.
     * @throws {Error} Если метод вызывается в базовом абстрактном классе.
     * @abstract
     */
    set playerCollection(value) {
        throw new Error("Метод 'playerCollection' должен быть реализован в наследуемом классе.");
    }

    /**
     * Инициализирует экземпляр класса с указанной коллекцией игроков.
     * Должен быть реализован в подклассах для обеспечения корректной инициализации.
     * @param {PlayerCollection} playerCollection - Коллекция игроков для инициализации.
     * @returns {Sorts} Экземпляр класса, наследующего от Sorts.
     * @throws {Error} Если метод вызывается в базовом абстрактном классе.
     * @abstract
     */
    static init(playerCollection) {
        throw new Error("Метод 'init' должен быть реализован в наследуемом классе.");
    }
}

module.exports = Sorts;