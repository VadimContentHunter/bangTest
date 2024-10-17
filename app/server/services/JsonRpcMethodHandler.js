const Login = require("../controllers/Login");

class JsonRpcMethodHandler {
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

        this.instance = new className(jsonRpcRequest.params ?? {});
    }

    // Метод для получения класса по имени метода
    getClass(methodName) {
        return this.registeredClasses[methodName] || null;
    }

    getResult() {
        return this.instance.getResult?.() ?? null;
    }

    // Свойство, хранящее зарегистрированные классы
    get registeredClasses() {
        return {
            Login: Login,
        };
    }
}

module.exports = JsonRpcMethodHandler;
