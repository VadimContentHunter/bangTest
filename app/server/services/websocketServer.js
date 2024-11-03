// websocketServer.js
const WebSocket = require("ws");
const {
    JsonRpcFormatter,
    JsonRpcFormatterError,
} = require("../../../node_modules/vadimcontenthunter-jsonrpc-formatter/src/JsonRpcFormatter");
const { parseCookies, createCookie } = require("./helper"); // Импортируем функции из хелпера
const url = require("url");
const SessionHandler = require("../handlers/SessionHandler");
const JsonRpcMethodHandler = require("./JsonRpcMethodHandler");
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const { log } = require("console");

module.exports = function setupWebSocketServer(server, playroomHandler) {
    if (!(playroomHandler instanceof PlayroomHandler)) {
        throw new Error("playroomHandler must be an instance of PlayroomHandler");
    }

    const wss = new WebSocket.Server({ server });

    // Событие при установлении нового соединения
    wss.on("connection", (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        const clientIp = req.socket.remoteAddress; // Получаем IP-адрес клиента
        const ip = clientIp.startsWith("::ffff:") ? clientIp.slice(7) : clientIp;
        console.log(`WebSocket: Новое соединение установлено с IP: ${ip}`);

        // Отправляем сообщение всем клиентам, когда клиент подключается
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                ws.send(
                    JsonRpcFormatter.serializeRequest("updateUserCount", {
                        quantity: playroomHandler.countPlayersOnline(),
                    })
                );
            }
        });

        // Слушаем сообщения от клиента
        ws.on("message", (message) => {
            const sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
            try {
                ws.send(
                    JsonRpcFormatter.serializeRequest("updateSessionId", {
                        sessionId: sessionId,
                        maxAge: SessionHandler.sessionLifetime * 1000,
                        path: "/",
                    })
                );

                const requestRpc = JsonRpcFormatter.deserializeRequest(message);
                requestRpc.params.sessionId = sessionId;
                requestRpc.params.playroomHandler = playroomHandler;

                const jsonRpcMethodHandler = new JsonRpcMethodHandler(requestRpc);
                if (jsonRpcMethodHandler.instance instanceof aResponseHandler) {
                    ws.send(
                        JsonRpcFormatter.serializeResponse(
                            jsonRpcMethodHandler.instance.getResult(),
                            requestRpc?.id
                        )
                    );
                }

                // const currentUserUrl = SessionHandler.getSessionData(sessionId);
                // if (currentUserUrl === "/playroom") {
                //     jsonRpcMethodHandler.setAdditionalParams(playroomHandler);
                // }
            } catch (error) {
                ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
                console.log(error);

                // serverInfo(
                //     sessionId,
                //     ip,
                //     "Error Message: " + error.message + "; Code: " + error.code ?? -32000
                // );
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
            try {
                const sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
                playroomHandler.removePlayerOnlineBySession(sessionId);
                // console.log(playroomHandler.countPlayersOnline());
                

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        ws.send(
                            JsonRpcFormatter.serializeRequest(
                                "updateUserCount",
                                playroomHandler.countPlayersOnline()
                            )
                        );
                    }
                });
            } catch (error) {
                if (error instanceof PlayroomHandlerError) {
                    console.log(error.message);
                }
            }

            console.log("WebSocket: Соединение закрыто");
        });
    });

    console.log("WebSocket: сервер запущен на порту 8080");
};
