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
const AuthHandler = require("../handlers/AuthHandler");
const PlayroomHandlerError = require("../Errors/PlayroomHandlerError");
const PlayroomHandler = require("../handlers/PlayroomHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const ServerHook = require("../hooks/ServerHook");
const { aCard, CardType } = require("../interfaces/aCard");
const StubCard = require("../models/cards/StubCard");
const Player = require("../models/Player");
const GameTableError = require("../Errors/GameTableError");
const GameTable = require("../models/GameTable");
const SelectionCardsError = require("../Errors/GameTableError");
const SelectionCardsHandler = require("../handlers/SelectionCardsHandler");
const GameHandlerError = require("../Errors/GameHandlerError");
const GameHandler = require("../handlers/GameHandler");
const DistanceError = require("../Errors/DistanceError");
const DistanceHandler = require("../handlers/DistanceHandler");
const AdminMenuError = require("../Errors/AdminMenuError");
const AdminMenuHandler = require("../handlers/AdminMenuHandler");

module.exports = function setupWebSocketServer(server, playroomHandler) {
    if (!(playroomHandler instanceof PlayroomHandler)) {
        throw new Error("playroomHandler must be an instance of PlayroomHandler");
    }

    const serverHook = new ServerHook();
    const wss = new WebSocket.Server({ server });
    const gameHandler = new GameHandler(playroomHandler);
    // const stubCard = aCard.initCard(
    //     {
    //         name: "StubCard",
    //         image: "../resources/imgs/cards/cardBacks/girl.png",
    //         type: CardType.DEFAULT,
    //         ownerName: "",
    //     },
    //     [StubCard]
    // );

    // Подписка на хуки
    serverHook.on("updateUserCount", () => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JsonRpcFormatter.serializeRequest("updateUserCount", {
                        quantity: playroomHandler.countPlayersOnline(),
                    })
                );
            }
        });
    });

    serverHook.on("requestAllUser", (requestMethodName, requestData) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JsonRpcFormatter.serializeRequest(requestMethodName, requestData));
            }
        });
    });

    serverHook.on("responseAllUser", (result, id = null) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                cws.send(JsonRpcFormatter.serializeResponse(result, id));
            }
        });
    });

    serverHook.on("Login", (ws, params, id = null) => {
        const authHandler = new AuthHandler(params?.user_name, params?.code, params?.sessionId);
        const isStatusLogin =
            authHandler.Authentication() && authHandler.Authorization(playroomHandler);
        ws.send(
            JsonRpcFormatter.serializeResponse(
                {
                    isStatusLogin: isStatusLogin,
                },
                id
            )
        );
    });

    serverHook.on("GetAdminMenu", (ws, params, id = null) => {
        const adminMenuHandler = new AdminMenuHandler(params?.sessionId);
        ws.send(JsonRpcFormatter.serializeResponse(adminMenuHandler.getAdminMenuTemplate(), id));
    });

    serverHook.on("StartGame", (ws, params, id = null) => {
        gameHandler.startGame();
        // ws.send(JsonRpcFormatter.serializeResponse(adminMenuHandler.getAdminMenuTemplate(), id));
    });

    // Событие при установлении нового соединения
    wss.on("connection", (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        const clientIp = req.socket.remoteAddress; // Получаем IP-адрес клиента
        const ip = clientIp.startsWith("::ffff:") ? clientIp.slice(7) : clientIp;
        let sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
        console.log(`WebSocket: Новое соединение установлено с IP: ${ip}`);

        try {
            const player = playroomHandler.connect(sessionId);
            if (player instanceof Player) {
                player.lives.max = 5;
                player.lives.current = 3;
                player.role = new StubCard(CardType.ROLE);
                player.character = new StubCard(CardType.CHARACTER);
                player.weapon = new StubCard(CardType.WEAPON);
                player.temporaryCards.setCards([
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                ]);
                player.hand.setCards([
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                ]);
                ws.send(JsonRpcFormatter.serializeRequest("getMyPlayer", player?.getInfo()));

                serverHook.emit(
                    "requestAllUser",
                    "createAllGameBoard",
                    playroomHandler.getAllPlayersSummaryInfo()
                );

                const gameTable = new GameTable();
                gameTable.deckMain.setCards([
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                ]);
                gameTable.discardPile.setCards([
                    new StubCard(CardType.WEAPON),
                    new StubCard(CardType.CHARACTER),
                    new StubCard(CardType.DEFAULT),
                ]);
                gameTable.addPlayerCards(player, [
                    new StubCard(CardType.DEFAULT),
                    new StubCard(CardType.WEAPON),
                ]);
                serverHook.emit("requestAllUser", "battleZoneUpdate", gameTable);

                serverHook.emit(
                    "requestAllUser",
                    "selectionCardsMenu",
                    new SelectionCardsHandler({
                        title: "Выбор карты для роли",
                        description: "Выберите карту для роли:",
                        textExtension: `Игрок <i>${player.name}</i> выбирает роль . . .`,
                        collectionCards: [
                            new StubCard(CardType.DEFAULT),
                            new StubCard(CardType.WEAPON),
                            new StubCard(CardType.CHARACTER),
                            new StubCard(CardType.DEFAULT),
                            new StubCard(CardType.DEFAULT),
                        ],
                        // selectIdCard: 1,
                        // timer: null,
                    })
                );
            }
        } catch (error) {
            ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
            console.log(error);
        }
        serverHook.emit("updateUserCount");

        // Слушаем сообщения от клиента
        ws.on("message", (message) => {
            // sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
            try {
                // ws.send(
                //     JsonRpcFormatter.serializeRequest("updateSessionId", {
                //         sessionId: sessionId,
                //         maxAge: SessionHandler.sessionLifetime * 1000,
                //         path: "/",
                //     })
                // );

                const requestRpc = JsonRpcFormatter.deserializeRequest(message);
                requestRpc.params.sessionId = sessionId;

                if (serverHook.listenerCount(requestRpc.method) === 0) {
                    throw new Error(`No listeners found for event: ${requestRpc.method}`);
                }
                serverHook.emit(requestRpc.method, ws, requestRpc.params, requestRpc?.id);
            } catch (error) {
                ws.send(JsonRpcFormatter.formatError(error.code ?? -32000, error.message));
                console.log(error);
            }
        });

        // Обрабатываем отключение клиента
        ws.on("close", () => {
            try {
                // sessionId = SessionHandler.getCreateSessionId(queryParams.cookies);
                playroomHandler.removePlayerOnlineBySession(sessionId);
                // console.log(playroomHandler.countPlayersOnline());

                serverHook.emit("updateUserCount");
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
