// websocketServer.js
const WebSocket = require("ws");
const {
    JsonRpcFormatter,
    JsonRpcFormatterError,
} = require("../../../node_modules/vadimcontenthunter-jsonrpc-formatter/src/JsonRpcFormatter");
const { parseCookies, createCookie } = require("./helper"); // Импортируем функции из хелпера
const url = require("url");
const SessionHandler = require("../handlers/SessionHandler");

// function updateCookies(cookies) {
//     const sessionId = SessionHandler.getCreateSessionId(cookies);
//     return JsonRpcFormatter.serializeRequest("updateSessionId", sessionId);
// }

module.exports = function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    // Событие при установлении нового соединения
    wss.on("connection", (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        const clientIp = req.socket.remoteAddress; // Получаем IP-адрес клиента
        const ip = clientIp.startsWith("::ffff:") ? clientIp.slice(7) : clientIp;
        console.log(`WebSocket: Новое соединение установлено с IP: ${ip}`);

        // Отправляем сообщение клиенту, когда он подключается
        ws.send("Добро пожаловать на сервер!");

        // Слушаем сообщения от клиента
        ws.on("message", (message) => {
            try {
                const requestRpc = JsonRpcFormatter.deserializeRequest(message);
                const sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
                ws.send(
                    JsonRpcFormatter.serializeRequest("updateSessionId", {
                        sessionId: sessionId,
                        maxAge: SessionHandler.sessionLifetime * 1000,
                        path: "/",
                    })
                );

                const currentUserUrl = SessionHandler.getSessionData(sessionId);
                // ws.send(JsonRpcFormatter.serializeResponse(sessionId, requestRpc?.id));
            } catch (error) {
                if (error instanceof JsonRpcFormatterError) {
                    console.error("Ошибка при десериализации запроса:", error.message);
                    message = error.message;
                }
                message = error.message;
                ws.send(JsonRpcFormatter.formatError(error.code, error.message));
                console.log("Error Message: " + message + "Code: " + error.code);
            }

            // Отправляем полученное сообщение обратно всем клиентам
            // wss.clients.forEach((client) => {
            //     if (client.readyState === WebSocket.OPEN) {
            //         client.send(`Эхо: ${message}`);
            //     }
            // });
        });

        // Обрабатываем отключение клиента
        ws.on("close", () => {
            console.log("WebSocket: Соединение закрыто");
        });
    });

    console.log("WebSocket: сервер запущен на порту 8080");
};
