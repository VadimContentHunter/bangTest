const ServerError = require("../Errors/ServerError");
const fs = require("fs");

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

// Функция для парсинга строки cookies в объект
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        const cookieArr = cookieHeader.split(";");
        cookieArr.forEach((cookie) => {
            const [key, value] = cookie.split("=");
            cookies[key.trim()] = value ? value.trim() : null;
        });
    }
    return cookies;
}

// Функция для замены параметров в HTML-шаблоне
function renderTemplate(filePath, params) {
    let html = fs.readFileSync(filePath, "utf-8");

    // Находим все плейсхолдеры {{param}} в шаблоне
    html = html.replace(/{{(.*?)}}/g, (match, key) => {
        // Если параметр определен в объекте params, подставляем его значение,
        // иначе заменяем на пустую строку
        return params[key] !== undefined ? params[key] : '';
    });

    return html;
}

module.exports = { parseJson };
module.exports = { parseCookies };
module.exports = { renderTemplate };
