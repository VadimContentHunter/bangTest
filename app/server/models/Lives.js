const LivesError = require("../Errors/LivesError");
const EventEmitter = require("events");

/**
 * Класс Lives представляет количество жизней с ограничением на максимум и проверками.
 */
class Lives {
    _max = 0;
    _current = 0;
    _events = null;

    /**
     * Создаёт новый объект Lives.
     * @param {number} max - Максимальное количество жизней.
     * @param {number} current - Текущее количество жизней.
     * @param {EventEmitter|null} [events=null] - Объект EventEmitter для вызова событий связанных с жизнями.
     * @throws {LivesError} Если max или current невалидны.
     */
    constructor(max = 0, current = 0, events = null) {
        this.max = max; // Используем сеттер
        this.current = current; // Используем сеттер
        this.events = events ?? new EventEmitter();
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
     * Геттер для объекта EventEmitter.
     * @returns {EventEmitter|null} Объект EventEmitter.
     */
    get events() {
        return this._events;
    }

    /**
     * Сеттер для объекта EventEmitter.
     * @param {EventEmitter|null} value - Новый объект EventEmitter.
     * @throws {LivesError} Если value не является экземпляром EventEmitter или null.
     */
    set events(value) {
        if (value !== null && !(value instanceof EventEmitter)) {
            throw new LivesError("events must be an instance of EventEmitter or null.");
        }
        this._events = value;
    }

    /**
     * Добавляет указанное количество жизней.
     * Генерирует событие "lifeAdded".
     * @param {number} amount - Количество жизней для добавления.
     * @param {boolean} [ignoreMaxCheck=false] - Флаг, указывающий, нужно ли игнорировать проверку на превышение максимума.
     * @throws {LivesError} Если amount не является положительным целым числом или превышает допустимый максимум (если ignoreMaxCheck=false).
     * @fires Lives#lifeAdded
     */
    addLives(amount, ignoreMaxCheck = false) {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new LivesError("Amount to add must be a non-negative integer.");
        }

        if (!ignoreMaxCheck && this._current + amount > this._max) {
            throw new LivesError(
                `Добавление ${amount} жизней превышает максимально допустимое значение ${this._max}.`
            );
        }

        const oldLives = this._current;
        this.current = ignoreMaxCheck
            ? this._current + amount
            : Math.min(this._current + amount, this._max);

        if (this.current > oldLives) {
            /**
             * Событие, вызываемое при добавлении жизней.
             * @event Lives#lifeAdded
             * @type {Object}
             * @property {number} oldLives - Количество жизней до изменения.
             * @property {number} newLives - Количество жизней после изменения.
             * @property {number} added - Количество добавленных жизней.
             */
            this.events?.emit("lifeAdded", {
                oldLives,
                newLives: this.current,
                added: this.current - oldLives,
            });
        }
    }

    /**
     * Отнимает указанное количество жизней.
     * Генерирует событие "lifeRemoved" и "livesDepleted", если жизни достигли нуля.
     * @param {number} amount - Количество жизней для отнимания.
     * @throws {LivesError} Если amount не является положительным целым числом.
     * @fires Lives#lifeRemoved
     * @fires Lives#livesDepleted
     */
    removeLives(amount) {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new LivesError("Amount to remove must be a non-negative integer.");
        }
        const oldLives = this._current;
        this.current = Math.max(this._current - amount, 0);

        if (this.current < oldLives) {
            /**
             * Событие, вызываемое при удалении жизней.
             * @event Lives#lifeRemoved
             * @type {Object}
             * @property {number} oldLives - Количество жизней до изменения.
             * @property {number} newLives - Количество жизней после изменения.
             * @property {number} removed - Количество удалённых жизней.
             */
            this.events?.emit("lifeRemoved", {
                oldLives,
                newLives: this.current,
                removed: oldLives - this.current,
            });

            // Генерация события "livesDepleted" при достижении нуля жизней.
            if (this.current === 0) {
                /**
                 * Событие, вызываемое при исчерпании жизней.
                 * @event Lives#livesDepleted
                 * @type {Object}
                 * @property {number} oldLives - Количество жизней до изменения.
                 * @property {number} removed - Количество удалённых жизней.
                 */
                this.events?.emit("livesDepleted", {
                    oldLives,
                    removed: oldLives, // Все оставшиеся жизни были удалены.
                });
            }
        }
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

    fullLife() {
        this.current = this.max;
    }

    /**
     * Возвращает JSON-представление объекта Lives.
     * @returns {Object} JSON-представление объекта Lives.
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
