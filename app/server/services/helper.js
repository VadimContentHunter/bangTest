const ServerError = require("../Errors/ServerError");
const fs = require("fs");

// Функция для парсинга JSON
function parseJson(input) {
    let json;

    if (typeof input === "string") {
        try {
            json = JSON.parse(input);
        } catch (error) {
            throw new ServerError("Неправильный формат данных. Ожидается объект JSON.", 400);
        }
    } else if (typeof input === "object" && input !== null) {
        json = input;
    } else {
        throw new ServerError("Неправильный формат данных. Ожидается объект JSON.", 400);
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

// Функция для создания куки
function createCookie(name, value, options = {}) {
    // Создаем объект для хранения куков
    const cookies = {};

    // Добавляем или обновляем новую куку
    cookies[name] = value;

    // Генерируем новую строку куки
    let cookieString = "";
    for (const [key, val] of Object.entries(cookies)) {
        cookieString += `${key}=${val}; `;
    }

    // Добавляем параметры из options
    for (const [key, optionValue] of Object.entries(options)) {
        if (key === "maxAge") {
            cookieString += `Max-Age=${optionValue}; `;
        } else if (key === "path") {
            cookieString += `Path=${optionValue}; `;
        } else if (key === "expires") {
            cookieString += `Expires=${optionValue.toUTCString()}; `;
        } else {
            cookieString += `${key}=${optionValue}; `;
        }
    }

    return cookieString.trim(); // Возвращаем итоговую строку куки без лишних пробелов
}

// Функция для замены параметров в HTML-шаблоне
function renderTemplate(filePath, params) {
    let html = fs.readFileSync(filePath, "utf-8");

    html = html.replace(/{{(.*?)}}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : "";
    });

    return html;
}

module.exports = { parseJson, parseCookies, createCookie, renderTemplate }; // Экспортируем все функции
