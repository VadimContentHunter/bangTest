const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const Player = require("../models/Player");

class PlayerCollection {
    constructor(useIncrementalId = true) {
        this.players = {};
        this.nextId = 1; // Следующий уникальный идентификатор для нового игрока
        this.useIncrementalId = useIncrementalId; // Флаг, определяющий, как будет происходить идентификация
    }

    /**
     * Генерирует новый ID для игрока.
     * Если useIncrementalId равно true, то используется инкрементный ID.
     * Если false, то используется первый свободный ID.
     * @returns {number} Новый ID игрока.
     */
    generateId() {
        if (this.useIncrementalId) {
            return this.nextId++;
        } else {
            // Находим первый свободный ID
            let id = 0;
            while (this.players.hasOwnProperty(id)) {
                id++;
            }
            return id;
        }
    }

    /**
     * Проверяет существование игрока по имени.
     * @param {string} name - Имя игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если имя не является строкой.
     */
    getPlayerByName(name) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой.");
        }
        return Object.values(this.players).find((player) => player.name === name) || null;
    }

    /**
     * Добавляет нового игрока с автоматическим увеличением ID.
     * @param {string} name - Имя игрока.
     * @param {string|null} [sessionId=null] - ID сессии игрока (по умолчанию null).
     * @returns {Player} Добавленный игрок.
     * @throws {ValidatePlayerError} Если игрок с таким именем уже существует или имя не является строкой.
     */
    addPlayer(name, sessionId = null) {
        if (typeof name !== "string") {
            throw new ValidatePlayerError("Имя должно быть строкой.");
        }

        if (typeof sessionId !== "string" && sessionId !== null) {
            throw new ValidatePlayerError("sessionId должен быть строкой или null.");
        }

        if (sessionId !== null && this.getPlayerBySessionId(sessionId) !== null) {
            throw new ValidatePlayerError("Игрок с таким sessionId уже в игре.");
        }

        // Проверка на существование игрока
        if (this.getPlayerByName(name) !== null) {
            throw new ValidatePlayerError(`Игрок с именем "${name}" уже существует.`);
        }

        const id = this.generateId(); // Генерация уникального ID для игрока
        const player = new Player(id, name, sessionId); // Создание нового игрока
        this.players[id] = player; // Добавляем игрока в коллекцию по его ID
        console.log(`Добавлен игрок с именем: ${name} и ID: ${id}`);
        return player;
    }

    /**
     * Устанавливает коллекцию игроков, присваивая каждому игроку новый уникальный ID.
     * @param {Array<Player>} players - Массив игроков, который будет установлен.
     * @throws {ValidatePlayerError} Если элементы массива не являются экземплярами класса Player.
     */
    setPlayersWithNewIds(players) {
        if (!Array.isArray(players)) {
            throw new ValidatePlayerError("players должен быть массивом.");
        }

        // Проверяем, что все элементы массива являются экземплярами Player
        players.forEach((player) => {
            if (!(player instanceof Player)) {
                throw new ValidatePlayerError(
                    "Все элементы массива должны быть экземплярами Player."
                );
            }
        });

        // Очищаем текущую коллекцию игроков
        this.players = {};

        // Добавляем игроков в коллекцию и присваиваем каждому новый ID
        players.forEach((player) => {
            const newId = this.generateId(); // Генерация нового уникального ID для игрока
            player.id = newId; // Устанавливаем новый ID для игрока
            this.players[newId] = player; // Добавляем игрока в коллекцию по новому ID
        });

        console.log(`Коллекция игроков обновлена. Всего игроков: ${players.length}`);
    }

    /**
     * Получает игрока по его ID.
     * @param {number} id - ID игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если ID не является числом.
     */
    getPlayerById(id) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }
        return this.players[id] || null;
    }

    /**
     * Получает игрока по sessionId.
     * @param {string} sessionId - ID сессии игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если sessionId не является строкой.
     */
    getPlayerBySessionId(sessionId) {
        if (typeof sessionId !== "string") {
            throw new ValidatePlayerError("sessionId должен быть строкой.");
        }
        return Object.values(this.players).find((player) => player.sessionId === sessionId) || null;
    }

    /**
     * Получает всех игроков по sessionId.
     * @param {string} sessionId - ID сессии игрока.
     * @returns {Player[]} Массив игроков с указанным sessionId. Пустой массив, если игроки не найдены.
     * @throws {ValidatePlayerError} Если sessionId не является строкой.
     */
    getAllPlayersBySessionId(sessionId) {
        if (typeof sessionId !== "string") {
            throw new ValidatePlayerError("sessionId должен быть строкой.");
        }
        return Object.values(this.players).filter((player) => player.sessionId === sessionId);
    }

    /**
     * Возвращает массив всех игроков, которые являются экземплярами Player.
     * @returns {Player[]} Массив игроков.
     */
    getPlayers() {
        return Object.values(this.players).filter((player) => player instanceof Player);
    }

    // Обновляет информацию об игроке по ID
    updatePlayerById(id, updates) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }

        const player = this.getPlayerById(id);
        if (player) {
            player.update(updates);
            console.log(`Игрок с ID ${id} обновлён.`);
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
    }

    // Обновляет информацию об игроке по имени
    updatePlayerByName(name, updates) {
        if (typeof name !== "string" || name.length === 0) {
            throw new ValidatePlayerError("Имя должно быть строкой и не должно быть пустым.");
        }

        const player = this.getPlayerByName(name);
        if (player) {
            player.update(updates);
            console.log(`Игрок с именем "${name}" обновлён.`);
        } else {
            throw new ValidatePlayerError(`Игрок с именем "${name}" не найден.`);
        }
    }

    // Обновляет информацию об игроке по sessionId
    updatePlayerBySessionId(sessionId, updates) {
        if (typeof sessionId !== "string") {
            throw new ValidatePlayerError("sessionId должен быть строкой.");
        }

        const player = this.getPlayerBySessionId(sessionId);
        if (player) {
            player.update(updates);
            console.log(`Игрок с sessionId "${sessionId}" обновлён.`);
        } else {
            throw new ValidatePlayerError(`Игрок с sessionId "${sessionId}" не найден.`);
        }
    }

    /**
     * Удаляет игрока по ID.
     * @param {number} id - ID игрока.
     * @throws {ValidatePlayerError} Если игрок не найден или ID не является числом.
     */
    removePlayerById(id) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }

        const player = this.getPlayerById(id);
        if (player) {
            delete this.players[id];
            console.log(`Игрок с ID ${id} удалён.`);
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
    }

    /**
     * Удаляет всех игроков.
     */
    removeAllPlayers() {
        this.players = {};
        this.nextId = 1;
    }

    /**
     * Удаляет игрока по имени.
     * @param {string} name - Имя игрока.
     * @throws {ValidatePlayerError} Если игрок не найден или name не является строкой.
     */
    removePlayerByName(name) {
        if (typeof name !== "string" || name.length === 0) {
            throw new ValidatePlayerError("Имя должно быть строкой и не должно быть пустым.");
        }

        const player = this.getPlayerByName(name); // Используем метод getPlayerByName для поиска игрока
        if (player) {
            delete this.players[player.id]; // Удаляем игрока по его ID
            console.log(`Игрок с именем "${name}" и ID ${player.id} удалён.`);
        } else {
            throw new ValidatePlayerError(`Игрок с именем "${name}" не найден.`);
        }
    }

    /**
     * Собирает данные всех игроков с помощью их метода getSummaryInfo.
     * @returns {Array<Object>} Массив данных всех игроков, полученных из getSummaryInfo.
     * @throws {Error} Если у игрока отсутствует метод getSummaryInfo.
     */
    getDataSummaryAllPlayers() {
        return Object.values(this.players)
            .filter((player) => typeof player.getSummaryInfo === "function") // Проверяем наличие метода getSummaryInfo
            .map((player) => player.getSummaryInfo()); // Вызываем метод getSummaryInfo и собираем данные в массив
    }

    /**
     * Подсчитывает общее количество игроков, которые являются экземплярами Player.
     * @returns {number} Количество игроков.
     */
    countAllPlayers() {
        return Object.values(this.players).filter((player) => player instanceof Player).length;
    }

    /**
     * Подсчитывает количество игроков с активной сессией (sessionId != null), которые являются экземплярами Player.
     * @returns {number} Количество игроков с активной сессией.
     */
    countPlayersWithSession() {
        return Object.values(this.players).filter(
            (player) => player instanceof Player && player.sessionId !== null
        ).length;
    }

    /**
     * @returns {Object} JSON-представление
     */
    toJSON() {
        return this.players;
    }
}

module.exports = PlayerCollection;
