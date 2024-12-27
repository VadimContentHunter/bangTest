const ValidatePlayerError = require("../../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../../interfaces/aCard");
const Player = require("../../models/Player");
const CharacterFilter = require("./Filters/CharacterFilter");
const iFilters = require("./Filters/iFilters");
const RoleFilter = require("./Filters/RoleFilter");

class PlayerCollection {
    constructor(useIncrementalId = true) {
        this.players = [];
        this.useIncrementalId = useIncrementalId; // Флаг, определяющий, как будет происходить идентификация
    }

    /**
     * Применяет фильтр к коллекции игроков, создавая экземпляр указанного класса фильтра.
     * Метод проверяет, наследуется ли переданный класс от iFilters, и создает его экземпляр.
     *
     * @template T
     * @param {new (playerCollection: PlayerCollection) => T} filterClass - Класс фильтра, который необходимо использовать.
     * Должен быть наследником iFilters.
     * @returns {T} Экземпляр фильтра, наследующего iFilters.
     * @throws {ValidatePlayerError} Если переданный класс не наследуется от iFilters.
     */
    useFilterClass(filterClass) {
        if (!(filterClass.prototype instanceof iFilters)) {
            throw new ValidatePlayerError(
                "Переданный класс не является фильтром, наследующим iFilters."
            );
        }

        // Создаем и возвращаем экземпляр фильтра
        const filter = new filterClass(this);

        // Проверяем и устанавливаем коллекцию игроков, если она отсутствует
        if (!(filter.playerCollection instanceof PlayerCollection)) {
            filter.playerCollection = this;
        }

        return filter;
    }

    /**
     * Генерирует новый ID для игрока.
     * Если useIncrementalId равно true, то используется инкрементный ID.
     * Если false, то используется первый свободный ID.
     * @returns {number} Новый ID игрока.
     */
    generateId() {
        if (this.useIncrementalId) {
            return this.players.length;
        } else {
            let id = 0;
            while (this.players.some((player) => player.id === id)) {
                id++;
            }
            return id;
        }
    }

    /**
     * Создает нового игрока на основе игрока из текущей коллекции, копируя указанные свойства из найденного игрока.
     * @param {Player} targetPlayer - Объект игрока.
     * @param {Player|string} playerOrNameCollection - Объект игрока или имя игрока из коллекции.
     * @param {Array<string>} propertiesToCopy - Массив свойств, которые нужно скопировать из найденного игрока.
     * @returns {Player|null} - Новый объект игрока с скопированными данными или null, если игрок не найден.
     */
    createPlayerFromPlayerCollection(targetPlayer, playerOrNameCollection, propertiesToCopy) {
        // Определяем, передан ли объект игрока или имя
        if (!(targetPlayer instanceof Player)) {
            return null;
        }

        // Определяем, передан ли объект игрока или имя Для поиска в коллекции
        let playerCollection = null;
        if (playerOrNameCollection instanceof Player) {
            playerCollection = this.getPlayerByName(playerOrNameCollection.name);
        } else if (typeof playerOrNameCollection === "string") {
            playerCollection = this.getPlayerByName(playerOrNameCollection);
        }

        // Если игрок не найден, возвращаем null
        if (!(targetPlayer instanceof Player) || !(playerCollection instanceof Player)) {
            return null;
        }

        // Проверяем, что propertiesToCopy - это массив
        if (!Array.isArray(propertiesToCopy)) {
            throw new TypeError("propertiesToCopy должен быть массивом строк.");
        }

        // Создаем нового игрока с копированием указанных свойств
        return Player.newMergePlayers(targetPlayer, playerCollection, propertiesToCopy);
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

        const player = new Player(this.generateId(), name, sessionId); // Создание нового игрока
        this.players.push(player);
        // console.log(`Добавлен игрок с именем: ${player.name} и ID: ${player.id}`);
    }

    /**
     * Добавляет игрока в коллекцию.
     * Если у игрока нет id Он будет сгенерирован.
     * @param {Player} player - Экземпляр класса Player.
     * @param {boolean} generateNewId - Флаг, указывающий, нужно ли генерировать новый ID для игрока.
     * @throws {ValidatePlayerError} Если переданный объект не является экземпляром Player.
     * @throws {ValidatePlayerError} Если игрок с таким ID уже существует в коллекции.
     */
    addPlayerFromInstance(player, generateNewId = false) {
        if (!(player instanceof Player)) {
            throw new ValidatePlayerError("Переданный объект должен быть экземпляром Player.");
        }

        if (generateNewId === true) {
            player.id = this.generateId(); // Генерация нового ID для игрока
        }

        if (!Number.isInteger(player.id)) {
            player.id = this.generateId(); // Генерация нового ID для игрока если его нет
        }

        // Проверяем, что игрок с таким ID ещё не существует в коллекции
        if (this.getPlayerById(player.id) instanceof Player) {
            throw new ValidatePlayerError(`Игрок с ID ${player.id} уже существует в коллекции.`);
        }

        // Добавляем игрока в коллекцию
        this.players.push(player);
        // console.log(`Игрок с ID ${player.id} добавлен в коллекцию.`);
    }

    /**
     * Устанавливает коллекцию игроков, присваивая каждому игроку новый уникальный ID.
     * @param {Array<Player>} players - Массив игроков, который будет установлен.
     * @param {boolean} generateNewId - Флаг, указывающий, нужно ли генерировать новый ID для игрока.
     * @throws {ValidatePlayerError} Если элементы массива не являются экземплярами класса Player.
     */
    setPlayers(players, generateNewId = false) {
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
        this.players = [];

        // Добавляем игроков в коллекцию и присваиваем каждому новый ID
        players.forEach((player) => {
            this.addPlayerFromInstance(player, generateNewId);
        });

        // console.log(`Коллекция игроков обновлена. Всего игроков: ${players.length}`);
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
        return this.players.find((player) => player.name === name) || null;
    }

    /**
     * Возвращает всех игроков, отсортированных по ID от меньшего к большему.
     * @returns {Player[]} Массив игроков, отсортированных по ID от меньшего к большему.
     */
    getPlayersSortedAsc() {
        return [...this.players].sort((a, b) => a.id - b.id); // Сортировка по ID от меньшего к большему
    }

    /**
     * Возвращает всех игроков, отсортированных по ID от большего к меньшему.
     * @returns {Player[]} Массив игроков, отсортированных по ID от большего к меньшему.
     */
    getPlayersSortedDesc() {
        return [...this.players].sort((a, b) => b.id - a.id); // Сортировка по ID от большего к меньшему
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
        return this.players.find((player) => player.sessionId === sessionId) || null;
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
        return this.players.filter((player) => player.sessionId === sessionId);
    }

    /**
     * Возвращает массив всех игроков, которые являются экземплярами Player.
     * @returns {Player[]} Массив игроков.
     */
    getPlayers() {
        return this.players.filter((player) => player instanceof Player);
    }

    /**
     * Собирает данные всех игроков с помощью их метода getSummaryInfo.
     * @returns {Array<Object>} Массив данных всех игроков, полученных из getSummaryInfo.
     * @throws {Error} Если у игрока отсутствует метод getSummaryInfo.
     */
    getDataSummaryAllPlayers() {
        return this.players
            .filter((player) => typeof player.getSummaryInfo === "function") // Проверяем наличие метода getSummaryInfo
            .map((player) => player.getSummaryInfo()); // Вызываем метод getSummaryInfo и собираем данные в массив
    }

    /**
     * Копирует указанные свойства из найденного в текущей коллекции игрока для targetPlayer.
     * @param {Player} targetPlayer - Объект игрока.
     * @param {Player|string} playerOrNameCollection - Объект игрока или имя игрока из коллекции.
     * @param {Array<string>} propertiesToCopy - Массив свойств, которые нужно скопировать из найденного игрока.
     * @returns {Player|null} - Объект игрока targetPlayer с скопированными данными или null, если игрок не найден.
     */
    copyPlayerFromPlayerCollection(targetPlayer, playerOrNameCollection, propertiesToCopy) {
        // Определяем, передан ли объект игрока или имя
        if (!(targetPlayer instanceof Player)) {
            return null;
        }

        // Определяем, передан ли объект игрока или имя Для поиска в коллекции
        let playerCollection = null;
        if (playerOrNameCollection instanceof Player) {
            playerCollection = this.getPlayerByName(playerOrNameCollection.name);
        } else if (typeof playerOrNameCollection === "string") {
            playerCollection = this.getPlayerByName(playerOrNameCollection);
        }

        // Если игрок не найден, возвращаем null
        if (!(targetPlayer instanceof Player) || !(playerCollection instanceof Player)) {
            return null;
        }

        // Проверяем, что propertiesToCopy - это массив
        if (!Array.isArray(propertiesToCopy)) {
            throw new TypeError("propertiesToCopy должен быть массивом строк.");
        }

        // Создаем нового игрока с копированием указанных свойств
        return Player.copyDataPlayer(targetPlayer, playerCollection, propertiesToCopy);
    }

    /**
     * Создает копию текущей коллекции игроков, копируя указанные свойства каждого игрока.
     * @returns {Player[]} - Массив новых объектов игроков с указанными свойствами.
     */
    copyPlayerCollectionFromCollection() {
        // Копируем коллекцию
        const copiedCollection = new PlayerCollection(this.useIncrementalId);
        this.players.forEach((player) => {
            const copiedPlayer = Player.copyDataPlayer(player, player);
            if (copiedPlayer instanceof Player) {
                copiedCollection.addPlayerFromInstance(copiedPlayer);
            }
        });

        return copiedCollection;
    }

    // Обновляет информацию об игроке по ID
    updatePlayerById(id, updates) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }

        const player = this.getPlayerById(id);
        if (player) {
            player.update(updates);
            // console.log(`Игрок с ID ${id} обновлён.`);
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
            // console.log(`Игрок с именем "${name}" обновлён.`);
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
            // console.log(`Игрок с sessionId "${sessionId}" обновлён.`);
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

        const index = this.players.findIndex((player) => player.id === id); // Находим индекс
        if (index !== -1) {
            this.players.splice(index, 1); // Удаляем игрока из массива
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
        // console.log(`Игрок с ID ${id} удалён.`);
    }

    /**
     * Удаляет всех игроков.
     */
    removeAllPlayers() {
        this.players = {};
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

        const index = this.players.findIndex((player) => player.name === name); // Находим индекс
        if (index !== -1) {
            this.players.splice(index, 1); // Удаляем игрока из массива
        } else {
            throw new ValidatePlayerError(`Игрок с именем "${name}" не найден.`);
        }

        // console.log(`Игрок с именем "${name}" удалён.`);
    }

    /**
     * Подсчитывает общее количество игроков, которые являются экземплярами Player.
     * @returns {number} Количество игроков.
     */
    countAllPlayers() {
        return this.players.filter((player) => player instanceof Player).length;
    }

    /**
     * Подсчитывает количество игроков с активной сессией (sessionId != null), которые являются экземплярами Player.
     * @returns {number} Количество игроков с активной сессией.
     */
    countPlayersWithSession() {
        return this.players.filter(
            (player) => player instanceof Player && player.sessionId !== null
        ).length;
    }

    // Метод для перемешивания ID игроков
    shufflePlayerIds() {
        // Перемешиваем массив игроков
        for (let i = this.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Случайный индекс
            [this.players[i], this.players[j]] = [this.players[j], this.players[i]]; // Меняем местами
        }
    }

    /**
     * @returns {Object} JSON-представление
     */
    toJSON() {
        return this.players;
    }

    /**
     * Статический метод для инициализации коллекции игроков из JSON или массива объектов.
     * @param {string | Object[]} inputData - Строка JSON или массив данных игроков.
     * @param {boolean} generateNewId — Флаг, указывающий, нужно ли генерировать новый ID для игрока.
     * @returns {PlayerCollection} - Экземпляр коллекции игроков.
     */
    static initFromJSON(inputData, generateNewId = false) {
        const playerCollection = new PlayerCollection(); // Создаем новый экземпляр коллекции

        try {
            // Если входные данные - строка, парсим её
            const playerDataArray =
                typeof inputData === "string" ? JSON.parse(inputData) : inputData;

            // Проверяем, что данные являются массивом
            if (!Array.isArray(playerDataArray)) {
                throw new TypeError("Данные должны быть массивом объектов игроков.");
            }

            // Обрабатываем каждый объект игрока
            playerDataArray.forEach((playerData) => {
                // Добавляем игрока в коллекцию
                playerCollection.addPlayerFromInstance(
                    Player.initFromJSON(playerData),
                    generateNewId
                );
            });
        } catch (error) {
            console.error("Ошибка при инициализации игроков из JSON или массива:", error);
        }

        return playerCollection; // Возвращаем заполненную коллекцию
    }
}

module.exports = PlayerCollection;
