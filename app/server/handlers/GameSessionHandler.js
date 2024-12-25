const fs = require("fs");
const path = require("path");
const ServerError = require("../Errors/ServerError");
const PlayerCollection = require("../handlers/PlayerCollection");
const Player = require("../models/Player");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const GameSessionHead = require("../models/GameSessionHead");
const HistoryHandlerError = require("../Errors/HistoryHandlerError");
const HistoryHandler = require("../handlers/HistoryHandler");

class GameSessionHandler {
    /**
     * Определяет, отключён ли файловый ввод/вывод.
     * Если `true`, методы сохранения и загрузки (`saveData` и `loadData`) игнорируют операции с файлами.
     * @type {boolean}
     * @private
     */
    _disableFileIO = false;

    /**
     * Создаёт экземпляр GameSessionHandler.
     * @param {boolean} [disableFileIO=false] - Флаг, указывающий, нужно ли отключить сохранение и загрузку данных из файлов.
     * @param {number|null} [maxMoves=null] - Максимальное количество ходов в истории.
     */
    constructor(disableFileIO = false, maxMoves = null) {
        this.filePath = null;
        this.head = new GameSessionHead();
        this.history = new HistoryHandler(maxMoves);
        this.disableFileIO = disableFileIO; // Используем сеттер для проверки значения
    }

    /**
     * Указывает, отключён ли файловый ввод/вывод.
     * @returns {boolean} true, если файловый ввод/вывод отключён, иначе false.
     */
    get disableFileIO() {
        return this._disableFileIO;
    }

    /**
     * Устанавливает значение свойства disableFileIO.
     * @param {boolean} value - Значение, указывающее, отключён ли файловый ввод/вывод.
     * @throws {TypeError} Если переданное значение не является булевым.
     */
    set disableFileIO(value) {
        if (typeof value !== "boolean") {
            throw new TypeError("disableFileIO должно быть типа boolean.");
        }
        this._disableFileIO = value;
    }

    // Генерация пути до файла сессий
    _generatePathToFile() {
        this.filePath = path.join(
            __dirname,
            "..",
            "..",
            "gameSessions",
            `game__${this._getFormattedDateTime()}.json`
        );
    }

    // Форматирование даты и времени
    _getFormattedDateTime() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}_${month}_${year}__${hours}_${minutes}_${seconds}`;
    }

    // Проверка head и history перед сохранением
    _validateSessionData() {
        if (!(this.head instanceof GameSessionHead)) {
            throw new ServerError("Invalid head data");
        }
        if (!(this.history instanceof HistoryHandler)) {
            throw new ServerError("Invalid history data");
        }
    }

    /**
     * Создаёт новую игровую сессию.
     * @throws {ServerError} Если игровая сессия уже существует.
     */
    createGameSession() {
        if (this.head.statusGame === true) {
            throw new ServerError(
                "GameSessionHandler: Cannot create game session while one already exists."
            );
        }
        this._generatePathToFile();
        this.head.statusGame = true;
        this.saveData();
        console.log(`GameSessionHandler: Game session created. File path: ${this.filePath}`);
    }

    /**
     * Сохраняет данные игровой сессии в файл.
     * @throws {ServerError} Если данные head или history некорректны.
     */
    saveData() {
        if (this.disableFileIO) {
            // console.log("GameSessionHandler: Сохранение отключено.");
            return;
        }
        this._validateSessionData();
        fs.writeFileSync(
            this.filePath,
            JSON.stringify(
                {
                    head: this.head,
                    history: this.history,
                },
                null,
                2
            ),
            "utf8"
        );
        console.log(`GameSessionHandler: Data saved to ${this.filePath}`);
    }

    /**
     * Загружает данные игровой сессии из файла.
     * @throws {ServerError} Если файл не существует или его формат некорректен.
     */
    loadData() {
        if (this.disableFileIO) {
            // console.log("GameSessionHandler: Загрузка отключена.");
            return;
        }
        if (fs.existsSync(this.filePath)) {
            const fileContent = fs.readFileSync(this.filePath, "utf8");
            const { head, history } = JSON.parse(fileContent);

            if (head && history) {
                this.head = GameSessionHead.initFromJSON(head);
                this.history = HistoryHandler.initFromJSON(history);
                console.log("GameSessionHandler: Data loaded successfully.");
            } else {
                throw new ServerError("GameSessionHandler: Invalid file format.");
            }
        } else {
            console.log("GameSessionHandler: No session file found, starting with empty data.");
        }
    }
}

module.exports = GameSessionHandler;
