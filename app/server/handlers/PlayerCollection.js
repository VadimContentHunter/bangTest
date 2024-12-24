const ValidatePlayerError = require("../Errors/ValidatePlayerError");
const { aCard, CardType } = require("../interfaces/aCard");
const Player = require("../models/Player");

class PlayerCollection {
    constructor(useIncrementalId = true) {
        this.players = [];
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
            return this.players.length;
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
        console.log(`Добавлен игрок с именем: ${player.name} и ID: ${player.id}`);
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
        console.log(`Игрок с ID ${player.id} добавлен в коллекцию.`);
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
        this.players = {};

        // Добавляем игроков в коллекцию и присваиваем каждому новый ID
        players.forEach((player) => {
            this.addPlayerFromInstance(player, generateNewId);
        });

        console.log(`Коллекция игроков обновлена. Всего игроков: ${players.length}`);
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
     * Получает игрока по его ID.
     * @param {number} id - ID игрока.
     * @returns {Player|null} Игрок, если найден; null, если не найден.
     * @throws {ValidatePlayerError} Если ID не является числом.
     */
    getPlayerById(id) {
        if (typeof id !== "number") {
            throw new ValidatePlayerError("ID должен быть числом.");
        }
        return this.players.find((player) => player.id === id);
    }

    /**
     * Возвращает всех игроков, отсортированных по ID от меньшего к большему.
     * @returns {Player[]} Массив игроков, отсортированных по ID от меньшего к большему.
     */
    getPlayersSortedAsc() {
        return Object.values(this.players).sort((a, b) => a.id - b.id); // Сортировка по ID от меньшего к большему
    }

    /**
     * Возвращает всех игроков, отсортированных по ID от большего к меньшему.
     * @returns {Player[]} Массив игроков, отсортированных по ID от большего к меньшему.
     */
    getPlayersSortedDesc() {
        return Object.values(this.players).sort((a, b) => b.id - a.id); // Сортировка по ID от большего к меньшему
    }

    /**
     * Находит игрока с минимальным id, исключая указанные id.
     *
     * Этот метод ищет игрока с минимальным id, при этом игнорируя игроков с id,
     * которые указаны в параметре `ignoredIds`.
     *
     * @param {Array<number>} [ignoredIds=[]] - Массив id игроков, которых нужно игнорировать.
     * @returns {Object|null} Игрок с минимальным id, или null, если подходящий игрок не найден.
     */
    getPlayerWithMinId(ignoredIds = []) {
        return Object.values(this.players).reduce((minPlayer, currentPlayer) => {
            // Проверяем, не нужно ли игнорировать текущего игрока
            if (ignoredIds.includes(currentPlayer.id)) {
                return minPlayer; // Пропускаем этого игрока
            }

            // Если текущий игрок имеет меньший id, чем текущий минимальный
            return currentPlayer.id < minPlayer.id ? currentPlayer : minPlayer;
        }, this.players[0] || null); // В случае пустого массива возвращаем null
    }

    /**
     * Возвращает игрока без роли или с картой, указанной в параметре cardsClass.
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие роли".
     * @returns {Player|null} Первый игрок без роли или с картой из cardsClass, или null, если таких игроков нет.
     */
    getPlayerWithoutRole(cardsClass = []) {
        return (
            Object.values(this.players).find((player) => {
                return (
                    !(player.role instanceof aCard) || // Роль отсутствует
                    player.role.type !== CardType.ROLE || // Некорректный тип карты роли
                    cardsClass.some((cardClass) => player.role.constructor.name === cardClass.name) // Роль в списке исключений
                );
            }) || null
        );
    }

    /**
     * Возвращает игрока без персонажа или с картой, указанной в параметре cardsClass.
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
     * @returns {Player|null} Первый игрок без персонажа или с картой из cardsClass, или null, если таких игроков нет.
     */
    getPlayerWithoutCharacter(cardsClass = []) {
        return (
            Object.values(this.players).find((player) => {
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
     * Возвращает всех игроков без роли или с картой, указанной в параметре cardsClass.
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие роли".
     * @returns {Player[]} Массив игроков без роли или с картой из cardsClass.
     */
    getPlayersWithoutRole(cardsClass = []) {
        return Object.values(this.players).filter((player) => {
            return (
                !(player.role instanceof aCard) || // Роль отсутствует
                player.role.type !== CardType.ROLE || // Некорректный тип карты роли
                cardsClass.some((cardClass) => player.role.constructor.name === cardClass.name) // Роль в списке исключений
            );
        });
    }

    /**
     * Возвращает всех игроков без персонажа или с картой, указанной в параметре cardsClass.
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие персонажа".
     * @returns {Player[]} Массив игроков без персонажа или с картой из cardsClass.
     */
    getPlayersWithoutCharacter(cardsClass = []) {
        return Object.values(this.players).filter((player) => {
            return (
                !(player.character instanceof aCard) || // Персонаж отсутствует
                player.character.type !== CardType.CHARACTER || // Некорректный тип карты персонажа
                cardsClass.some((cardClass) => player.character.constructor.name === cardClass.name) // Персонаж в списке исключений
            );
        });
    }

    /**
     * Находит игрока с минимальным id среди тех, у которых отсутствует роль
     * или роль находится в списке исключений, игнорируя указанные id.
     *
     * Этот метод комбинирует логику методов `getPlayersWithoutRole` и `getPlayerWithMinId`.
     *
     * @param {Array<Card>} cardsClass - Массив классов карт, которые считаются как "отсутствие роли".
     * @param {Array<number>} [ignoredIds=[]] - Массив id игроков, которых нужно игнорировать.
     * @returns {Object|null} Игрок с минимальным id, или null, если подходящий игрок не найден.
     */
    getPlayerWithMinIdWithoutRole(cardsClass = [], ignoredIds = []) {
        // Используем метод getPlayersWithoutRole для получения списка игроков без роли
        const playersWithoutRole = this.getPlayersWithoutRole(cardsClass);

        // Теперь используем метод getPlayerWithMinId для поиска игрока с минимальным id среди игроков без роли
        return PlayerCollection.findPlayerWithMinIdExcludingIgnored(ignoredIds, playersWithoutRole);
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

        const index = this.players.findIndex((player) => player.id === id); // Находим индекс
        if (index !== -1) {
            this.players.splice(index, 1); // Удаляем игрока из массива
        } else {
            throw new ValidatePlayerError("Игрок не найден");
        }
        console.log(`Игрок с ID ${id} удалён.`);
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

        console.log(`Игрок с именем "${name}" удалён.`);
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

    /**
     * Статистический метод для нахождения игрока с минимальным id, исключая указанные id.
     *
     * Этот метод принимает массив игроков и находит среди них игрока с минимальным id,
     * исключая тех игроков, чьи id указаны в массиве ignoredIds.
     *
     * @param {Array<number>} [ignoredIds=[]] - Массив id игроков, которых нужно игнорировать.
     * @param {Array<Player>} players - Массив объектов игроков, в котором нужно искать минимальный id.
     * @returns {Player|null} Игрок с минимальным id, исключая указанные id, или null, если подходящий игрок не найден.
     */
    static findPlayerWithMinIdExcludingIgnored(ignoredIds = [], players = []) {
        if (!Array.isArray(players) || players.length === 0) {
            return null; // Возвращаем null, если массив игроков пуст
        }

        // Инициализируем минимального игрока первым игроком в списке, если он не игнорируется
        let minPlayer = null;

        for (let player of players) {
            // Проверяем, что id игрока существует и не игнорируется
            if (Number.isInteger(player.id) && !ignoredIds.includes(player.id)) {
                // Если minPlayer еще не найден или текущий игрок имеет меньший id
                if (minPlayer === null || player.id < minPlayer.id) {
                    minPlayer = player;
                }
            }
        }

        return minPlayer || null; // Если minPlayer не найден, возвращаем null
    }
}

module.exports = PlayerCollection;
