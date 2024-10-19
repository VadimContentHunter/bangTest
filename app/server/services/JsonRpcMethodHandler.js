const aResponseHandler = require("../interfaces/aResponseHandler");

// Реестр классов
const classRegistry = {
    Login: require("../controllers/Login"),
    // другие классы
};

/**
 * Класс JsonRpcMethodHandler обрабатывает JSON-RPC запросы, динамически
 * создавая экземпляры соответствующих классов, которые наследуют aResponseHandler.
 */
class JsonRpcMethodHandler {
    /**
     * Конструктор принимает JSON-RPC запрос и создает экземпляр класса
     * на основе метода запроса.
     * @param {Object} jsonRpcRequest - JSON-RPC объект запроса.
     * @param {string} jsonRpcRequest.method - Имя метода JSON-RPC.
     * @param {number|null} jsonRpcRequest.id - ID запроса или null.
     * @param {Object} [jsonRpcRequest.params] - Параметры запроса.
     * @throws {Error} Если jsonRpcRequest невалиден или не удается найти класс.
     */
    constructor(jsonRpcRequest) {
        // Проверка на валидность jsonRpcRequest
        if (
            typeof jsonRpcRequest !== "object" ||
            typeof jsonRpcRequest.method !== "string" ||
            (jsonRpcRequest.id !== null && typeof jsonRpcRequest.id !== "number")
        ) {
            throw new Error("Invalid jsonRpcRequest object");
        }

        // Динамическое получение класса по имени
        const className = this.getClass(jsonRpcRequest.method);
        if (typeof className !== "function") {
            throw new Error(`Class '${jsonRpcRequest.method}' not found`);
        }

        // Проверка на наследование от aResponseHandler
        this.instance = new className(jsonRpcRequest.params ?? {});
        if (!(this.instance instanceof aResponseHandler)) {
            this.instance = null;
            throw new Error(
                `Class '${jsonRpcRequest.method}' не является наследником aResponseHandler`
            );
        }
    }

    /**
     * Метод для получения класса по имени метода JSON-RPC.
     * @param {string} methodName - Имя метода JSON-RPC.
     * @returns {Function|null} Возвращает класс, соответствующий методу, или null.
     */
    getClass(methodName) {
        return classRegistry[methodName] || null;
    }
}

module.exports = JsonRpcMethodHandler;
