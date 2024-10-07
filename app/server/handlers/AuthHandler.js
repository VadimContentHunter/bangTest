const ServerError = require("../Errors/ServerError");
const { parseJson } = require("../services/helper");

class AuthHandler {
  constructor(input) {
    let json = parseJson(input);

    // Проверка наличия и типа поля 'name'
    if (typeof json.name !== "string" || json.name === "") {
      throw new ServerError("Неправильное имя пользователя", 401);
    }

    // Инициализация поля 'name'
    this.name = json.name;
  }

  /**
   * Проверка подлинности личности пользователя
   */
  Authentication() {
    // Ваша логика
  }

  /**
   * Предоставление пользователю прав
   */
  Authorization() {
    // Ваша логика
  }
}
