const LivesError = require("../Errors/LivesError");
const EventEmitter = require("events");

/**
 * @event Lives#lifeLost
 * @description Событие испускается, когда игрок теряет жизни.
 * @param {number} oldLives - Количество жизней до изменения.
 * @param {number} amountLost - Количество потерянных жизней.
 * @param {number} remainingLives - Оставшееся количество жизней.
 */

/**
 * Класс Lives представляет количество жизней с ограничением на максимум и проверками.
 * @extends EventEmitter
 * @fires Lives#lifeLost - Событие, испускаемое, когда игрок теряет жизни.
 */
class Lives extends EventEmitter {
    _max = 0;
    _current = 0;

    /**
     * Создаёт новый объект Lives.
     * @param {number} max - Максимальное количество жизней.
     * @param {number} current - Текущее количество жизней.
     * @throws {LivesError} Если max или current невалидны.
     */
    constructor(max = 0, current = 0) {
        super();
        this.max = max; // Используем сеттер
        this.current = current; // Используем сеттер
    }

    /**
     * Устанавливает максимальное количество жизней.
     * Если текущее количество жизней превышает новое значение, оно корректируется.
     * @param {number} value - Новое максимальное количество жизней.
     * @throws {LivesError} Если значение не является неотрицательным целым числом.
     */
    set max(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new LivesError("Max lives must be a non-negative integer.");
        }
        this._max = value;

        if (this._current > value) {
            this._current = value; // Снижаем current до max
        }
    }

    /**
     * Устанавливает текущее количество жизней.
     * @param {number} value - Новое значение текущих жизней.
     * @throws {LivesError} Если значение не является неотрицательным целым числом или превышает max.
     */
    set current(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new LivesError("Current lives must be a non-negative integer.");
        }
        if (value > this._max) {
            throw new LivesError("Current lives cannot exceed max lives.");
        }
        this._current = value;
    }

    /**
     * Возвращает максимальное количество жизней.
     * @returns {number} Максимальное количество жизней.
     */
    get max() {
        return this._max;
    }

    /**
     * Возвращает текущее количество жизней.
     * @returns {number} Текущее количество жизней.
     */
    get current() {
        return this._current;
    }

    /**
     * Добавляет указанное количество жизней.
     * @param {number} amount - Количество жизней для добавления.
     * @throws {LivesError} Если amount не является положительным целым числом.
     */
    addLives(amount) {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new LivesError("Amount to add must be a non-negative integer.");
        }
        this.current = Math.min(this._current + amount, this._max);
    }

    /**
     * Отнимает указанное количество жизней.
     *
     * @param {number} amount - Количество жизней для отнимания.
     * @throws {LivesError} Если amount не является положительным целым числом.
     * @fires Lives#lifeLost - Испускается при уменьшении количества жизней.
     */
    removeLives(amount) {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new LivesError("Amount to remove must be a non-negative integer.");
        }

        const oldLives = this._current;
        this.current = Math.max(this._current - amount, 0);

        // if (oldLives > this._current) {
            // this.emit("lifeLost", {
            //     oldLives,
            //     amountLost: oldLives - this._current,
            //     remainingLives: this._current,
            // });
        // }
    }

    /**
     * Добавляет одну жизнь.
     */
    addOneLife() {
        this.addLives(1);
    }

    /**
     * Отнимает одну жизнь.
     */
    removeOneLife() {
        this.removeLives(1);
    }

    /**
     * @returns {Object} JSON-представление дистанции
     */
    toJSON() {
        return {
            max: this.max,
            current: this.current,
        };
    }

    /**
     * Инициализирует экземпляр Lives из JSON-данных.
     * @param {Object} data - Данные Lives в формате JSON.
     * @returns {Lives} Новый экземпляр Lives.
     */
    static initFromJSON(data) {
        return new Lives(data?.max ?? 0, data?.current ?? 0);
    }
}

module.exports = Lives;
