const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const Move = require("../models/Move"); // Предполагается, что класс Move импортируется из модели хода

class HistoryHandler {
    _moves = []; // Приватный массив для хранения ходов
    _maxMoves = null; // Максимальное количество хранимых ходов (null для хранения всех)

    /**
     * @param {number|null} maxMoves - Максимальное количество хранимых ходов (null для хранения всех).
     */
    constructor(maxMoves = null) {
        this.maxMoves = maxMoves;
    }

    /**
     * Устанавливает максимальное количество хранимых ходов.
     * @param {number|null} value - Новое значение maxMoves (null для хранения всех).
     */
    set maxMoves(value) {
        if (value !== null && (typeof value !== "number" || value <= 0)) {
            throw new HistoryHandlerError("maxMoves должен быть положительным числом или null.");
        }
        this._maxMoves = value;

        // Удаляем старые ходы, если превышен новый maxMoves
        if (this.maxMoves !== null && this._moves.length > this.maxMoves) {
            this._moves = this._moves.slice(-this.maxMoves);
        }
    }

    /**
     * Возвращает текущее значение maxMoves.
     * @returns {number|null} Текущее значение maxMoves.
     */
    get maxMoves() {
        return this._maxMoves;
    }

    /**
     * Добавляет новый ход в историю.
     * @param {Move} move - Объект хода.
     */
    addMove(move) {
        if (!(move instanceof Move)) {
            throw new HistoryHandlerError("Невалидный ход. Ожидается объект Move.");
        }

        // Проверка на уникальность номера хода, если не null
        if (move.moveNumber !== null) {
            const existingMove = this._moves.find((m) => m.moveNumber === move.moveNumber);
            if (existingMove) {
                throw new HistoryHandlerError(
                    `Номер хода ${move.moveNumber} уже существует в истории.`
                );
            }
        }

        move.moveNumber = this._moves.length + 1;
        this._moves.push(move);

        // Удаляем старые ходы, если превышен maxMoves
        if (this.maxMoves !== null && this._moves.length > this.maxMoves) {
            this._moves.shift();
        }
    }

    /**
     * Устанавливает список ходов.
     * @param {Move[]} moves - Массив объектов хода.
     */
    setMoves(moves) {
        if (!Array.isArray(moves)) {
            throw new HistoryHandlerError("Moves должны быть массивом.");
        }

        this._moves = [];
        moves.forEach((move) => this.addMove(move));
    }

    /**
     * Возвращает все ходы.
     * @returns {Move[]} Массив всех ходов.
     */
    getAllMoves() {
        return this._moves;
    }

    /**
     * Возвращает ход по номеру.
     * @param {number} moveNumber - Номер хода.
     * @returns {Move} Ход с указанным номером.
     */
    getMoveByNumber(moveNumber) {
        const move = this._moves.find((move) => move.moveNumber === moveNumber);
        if (!move) {
            throw new HistoryHandlerError(`Ход с номером ${moveNumber} не найден.`);
        }

        return move;
    }

    /**
     * Возвращает последний ход в истории.
     * @returns {Move} Последний ход.
     */
    getLastMove() {
        if (this._moves.length === 0) {
            throw new HistoryHandlerError("История пуста.");
        }

        return this._moves[this._moves.length - 1];
    }

    /**
     * Возвращает первый ход в истории.
     * @returns {Move} Первый ход.
     */
    getFirstMove() {
        if (this._moves.length === 0) {
            throw new HistoryHandlerError("История пуста.");
        }

        return this._moves[0];
    }

    /**
     * Удаляет ход по номеру.
     * @param {number} moveNumber - Номер хода.
     */
    removeMoveByNumber(moveNumber) {
        const index = this._moves.findIndex((move) => move.moveNumber === moveNumber);
        if (index === -1) {
            throw new HistoryHandlerError(`Ход с номером ${moveNumber} не найден.`);
        }

        this._moves.splice(index, 1); // Удаление хода из массива
    }

    /**
     * Очищает всю историю ходов.
     */
    clearHistory() {
        this._moves = [];
    }

    /**
     * @returns {Object} JSON-представление
     */
    toJSON() {
        return this._moves;
    }

    static initFromJSON(inputData, maxMoves = null) {
        const historyHandler = new HistoryHandler(maxMoves); // Создаем новый экземпляр коллекции

        const historyDataArray = typeof inputData === "string" ? JSON.parse(inputData) : inputData;

        if (!Array.isArray(historyDataArray)) {
            throw new TypeError("Данные должны быть массивом объектов Истории ходов.");
        }

        historyDataArray.forEach((moveData) => {
            historyHandler.addMove(Move.initFromJSON(moveData));
        });

        return historyHandler;
    }
}

module.exports = HistoryHandler;
