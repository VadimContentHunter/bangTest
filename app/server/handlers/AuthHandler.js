const ServerError = require("../Errors/ServerError");
const ValidateLoginError = require("../Errors/ValidateLoginError");
const { parseJson } = require("../services/helper");

class AuthHandler {
    constructor(name = null, sessionId = null) {
        this.name = name;
        this.sessionId = sessionId;
    }

    /**
     * Проверка подлинности личности пользователя
     */
    Authentication() {
        this.validateName(this.name);
        return true;
    }

    /**
     * Предоставление пользователю прав
     */
    Authorization() {
        return true;
    }

    validateName(name) {
        // Проверка типа
        if (typeof name !== "string") {
            throw new ValidateLoginError("Имя должно быть строкой", 1);
        }

        // Проверка длины
        if (name.length <= 4) {
            throw new ValidateLoginError("Имя должно содержать более 4 символов", 1);
        }

        // Проверка на разрешенные символы (A-z)
        const regex = /^[A-Za-z]+$/; // Регулярное выражение для проверки только латинских букв
        if (!regex.test(name)) {
            throw new ValidateLoginError(
                "Имя может содержать только латинские буквы (A-Z, a-z)",
                1
            );
        }
    }
}

module.exports = AuthHandler;
