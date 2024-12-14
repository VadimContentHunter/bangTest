const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const Move = require("../models/Move"); // Предполагается, что класс Move импортируется из модели хода

class HistoryHandler {
    _moves = []; // Приватный массив для хранения ходов

    /**
     * Добавляет новый ход в историю.
     * @param {Move} move - Объект хода.
     */
    addMove(move) {
        if (!(move instanceof Move)) {
            throw new HistoryHandlerError("Невалидный ход. Ожидается объект Move.");
        }

        // Проверка на уникальность номера хода
        const existingMove = this._moves.find((m) => m.moveNumber === move.moveNumber);
        if (existingMove) {
            throw new HistoryHandlerError(
                `Номер хода ${move.moveNumber} уже существует в истории.`
            );
        }

        this._moves.push(move);
    }

    /**
     * Устанавливает список ходов.
     * @param {Move[]} moves - Массив объектов хода.
     */
    setMoves(moves) {
        if (!Array.isArray(moves)) {
            throw new HistoryHandlerError("Moves должны быть массивом.");
        }

        // Проверка на уникальность номеров ходов
        const moveNumbers = new Set();
        for (const move of moves) {
            if (moveNumbers.has(move.moveNumber)) {
                throw new HistoryHandlerError(
                    `Номер хода ${move.moveNumber} должен быть уникальным.`
                );
            }
            moveNumbers.add(move.moveNumber);
        }

        this._moves = moves;
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

    static initFromJSON(json) {
        const gameSessionHeadHandler = new GameSessionHead();
        gameSessionHeadHandler.statusGame = json.statusGame;
        gameSessionHeadHandler.playersDistances = DistanceHandler.initFromJSON(
            json.playersDistances
        );
        return gameSessionHeadHandler;
    }
}

module.exports = HistoryHandler;
