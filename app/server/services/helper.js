const ServerError = require("../Errors/ServerError");

function parseJson(input) {
  let json;

  // Проверяем, является ли входное значение строкой
  if (typeof input === "string") {
    try {
      json = JSON.parse(input); // Пробуем распарсить строку в объект
    } catch (error) {
      throw new ServerError(
        "Неправильный формат данных. Ожидается объект JSON.",
        400
      );
    }
  } else if (typeof input === "object" && input !== null) {
    json = input; // Если это уже объект, просто присваиваем его
  } else {
    throw new ServerError(
      "Неправильный формат данных. Ожидается объект JSON.",
      400
    );
  }

  return json;
}

module.exports = { parseJson }; // Экспортируем функции
