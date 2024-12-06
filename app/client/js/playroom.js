class ResponseServerError extends Error {
    constructor(message, statusCode = 1000) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class RequestServerError extends Error {
    constructor(message, statusCode = 2000) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Функция для извлечения <script> тегов из HTML и их выполнения
 * @param {string} html - HTML строка, содержащая <script> теги
 */
function executeScriptsFromHTML(html) {
    // Создаём временный элемент для работы с HTML-контентом
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Вставляем основной HTML (без <script> тегов) в DOM
    // document.body.insertAdjacentHTML(
    //     "beforeend",
    //     tempDiv.innerHTML.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    // );

    // Извлекаем все <script> теги
    const scripts = tempDiv.querySelectorAll("script");

    // Добавляем каждый <script> в конец <body> для выполнения
    scripts.forEach((script) => {
        const newScript = document.createElement("script");

        if (script.src) {
            // Если есть src, загружаем скрипт по ссылке
            newScript.src = script.src;
        } else {
            // Если скрипт встроенный, добавляем его содержимое
            newScript.textContent = script.textContent;
        }

        document.body.append(newScript);
    });
}

// Функция проверки существования класса и его методов (включая статические)
function checkClassAndMethods(className, requiredMethods = [], staticMethods = []) {
    if (typeof className === "undefined") {
        console.log(`Класс ${className.name} не существует`);
        return false;
    }

    // Проверка методов в прототипе (для обычных методов)
    for (let method of requiredMethods) {
        if (typeof className.prototype[method] !== "function") {
            console.log(`Метод ${method} не существует в классе ${className.name}`);
            return false;
        }
    }

    // Проверка статических методов
    for (let method of staticMethods) {
        if (typeof className[method] !== "function") {
            console.log(`Статический метод ${method} не существует в классе ${className.name}`);
            return false;
        }
    }

    return true;
}

// Проверка на наличие ошибки
function checkErrorClass(errorClass) {
    return typeof errorClass !== "undefined" && errorClass.prototype instanceof Error;
}

function updateSessionId({ sessionId, maxAge, path }) {
    if (!sessionId || !maxAge || !path) {
        throw new Error("Не удалось обновить сессию");
    }

    document.cookie = `sessionId=${sessionId}; max-age=${maxAge}; path=${path};`;
}

function updateUserCount({ quantity }, selector) {
    if (typeof quantity !== "number") {
        throw new Error("Не удалось обновить количество игроков онлайн.");
    }

    console.log("Всего онлайн " + quantity);
}

/**=============================================================================================**/

function responseServer(requestManager, notificationsHtml, response) {
    if (!(notificationsHtml instanceof NotificationsHtml)) {
        console.error("Объект notificationsHtml не является экземпляром NotificationsHtml");
        throw new ResponseServerError("Не удалось обработать ответ.");
    }

    if (!(requestManager instanceof RequestManager)) {
        throw new ResponseServerError("requestManager not instanceof RequestManager");
    }

    if (response.result) {
        if (typeof response.id === "number") {
            const requestItem = requestManager.removeRequestById(response.id);
            switch (requestItem?.nameMethod) {
                case "GetAdminMenu":
                    const menu = document.querySelector("header .menu-line-mini");
                    if (menu instanceof HTMLElement && typeof response.result === "string") {
                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = response.result.replace(
                            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
                            ""
                        );

                        menu.prepend(...tempDiv.childNodes);

                        executeScriptsFromHTML(response.result);
                    }
                    break;
                default:
                    throw new ResponseServerError(
                        "Id ответа не найден в списке запросов. id: " + response.id
                    );
            }
        } else if (response.id === null) {
        } else {
            console.error("response id not corrected");
            return;
        }
    } else if (response.error) {
        const error = JsonRpcFormatter.verificationError(response.error);
        throw new ResponseServerError(error?.message ?? "Неизвестная ошибка", error?.code ?? -1);
    } else {
        console.error("Неизвестный ответ:", response);
    }
}

function requestServer(request, data = {}, ws) {
    switch (request.method) {
        case "updateSessionId":
            updateSessionId(request?.params);
            break;
        case "updateUserCount":
            updateUserCount(request?.params, "#user-count");
            break;
        case "selectionCardsMenu":
            if (data.cardSelection instanceof CardSelection) {
                const cardSelection = data.cardSelection;
                cardSelection.title = request?.params?.title;
                cardSelection.description = request?.params?.description;
                cardSelection.textExtension = request?.params?.textExtension;
                cardSelection.timer = request?.params?.timer;
                const collectionCards = request?.params?.collectionCards;
                if (Array.isArray(collectionCards) && collectionCards.length > 0) {
                    collectionCards.forEach((card) => {
                        cardSelection.addCardToContainer(card);
                    });
                    cardSelection.renderUpdatedData();
                }
                cardSelection.setupDragCardListener();
                cardSelection.showMainController();
            } else {
                console.error(
                    "requestServer ('battleZoneUpdate'): data.battleZone must be BattleZone"
                );
            }
            break;
        case "battleZoneUpdate":
            if (data.battleZone instanceof BattleZone) {
                const battleZone = data.battleZone;
                battleZone.countMainDeck = request?.params?.countDeckMain ?? 0;
                battleZone.countDiscardPile = request?.params?.countDiscardPile ?? 0;
                battleZone.timer = request?.params?.timer;
                const collectionCards = request?.params?.collectionCards;
                if (Array.isArray(collectionCards) && collectionCards.length > 0) {
                    collectionCards.forEach((card) => {
                        battleZone.addCardToContainer(card);
                    });
                    battleZone.renderUpdatedData();
                }
            } else {
                console.error(
                    "requestServer ('battleZoneUpdate'): data.battleZone must be BattleZone"
                );
            }
            break;
        case "getMyPlayer":
            if (data.playerHand instanceof PlayerHand) {
                data.playerHand.name = request?.params?.name;
                data.playerHand.lives = request?.params?.lives?.current ?? 0;
                data.playerHand.maxLives = request?.params?.lives?.max ?? 0;
                data.playerHand.tempCards = request?.params?.temporaryCards?.cards ?? [];
                data.playerHand.handCards = request?.params?.hand?.cards ?? [];
                data.playerHand.quantityAllHandCards = request?.params?.hand?.countCards ?? 0;

                if (request?.params?.role != null) {
                    data.playerHand.role = request?.params?.role;
                }
                if (request?.params?.character != null) {
                    data.playerHand.character = request?.params?.character;
                }
                if (request?.params?.weapon != null) {
                    data.playerHand.weapon = request?.params?.weapon;
                }
                data.playerHand.renderUpdatedData();
            } else {
                console.error("requestServer ('getMyPlayer'): data.playerHand must be PlayerHand");
            }
            break;
        case "createAllGameBoard":
            if (!(data.playersFieldElement instanceof HTMLElement)) {
                console.error("requestServer: data.playersFieldElement must be HTMLElement");
                return;
            }
            const elementsToRemove = data.playersFieldElement.querySelectorAll(
                ".grid-item:not(.battle-zone)"
            );
            elementsToRemove.forEach((element) => {
                if (element.gameBoardInstance instanceof GameBoard) {
                    element.gameBoardInstance.destroy();
                }
                element.remove();
            });

            const collectionPlayers = request?.params;
            if (Array.isArray(collectionPlayers) && collectionPlayers.length > 0) {
                collectionPlayers.forEach((player) => {
                    const gridItem = document.createElement("div");
                    gridItem.classList.add("grid-item");
                    if (
                        data.playerHand instanceof PlayerHand &&
                        data.playerHand.name === player?.name
                    ) {
                        gridItem.classList.add("my-player");
                    }

                    const gameBoard = new GameBoard();
                    gameBoard.name = player.name;
                    gameBoard.lives = player?.lives?.current ?? 0;
                    gameBoard.maxLives = player?.lives?.max ?? 0;
                    gameBoard.tempCards = player?.temporaryCards?.cards ?? [];
                    gameBoard.countHandCards = player?.countHand ?? 0;

                    if (player?.role != null) {
                        gameBoard.role = player?.role;
                    }
                    if (player?.character != null) {
                        gameBoard.character = player?.character;
                    }
                    if (player?.weapon != null) {
                        gameBoard.weapon = player?.weapon;
                    }
                    gameBoard.initAndCreateToContainer(gridItem);
                    gameBoard.renderUpdatedData();
                    if (
                        data.playerHand instanceof PlayerHand &&
                        data.battleZone instanceof BattleZone
                    ) {
                        gameBoard.setupDragCardListener(data.playerHand, data.battleZone);
                    }

                    gridItem.gameBoardInstance = gameBoard;
                    data.playersFieldElement.append(gridItem);
                });
            }
            break;
        default:
            throw new RequestServerError("Неизвестный запрос от сервера: " + response);
        // console.error("Неизвестный запрос от сервера:", response);
    }
}

function errorHandler(error, notificationsHtml) {
    if (!(notificationsHtml instanceof NotificationsHtml)) {
        console.error("Объект notificationsHtml не является экземпляром NotificationsHtml");
    } else {
        notificationsHtml.addNotification(error.message);
    }
}

// Основная логика
function main() {
    if (typeof serverIp !== "string") {
        return console.log("Нет константы для переменной serverIp");
    }

    if (!checkErrorClass(JsonRpcFormatterError)) {
        return console.log(
            "Класс JsonRpcFormatterError не существует или не является наследником Error"
        );
    }

    if (
        !checkClassAndMethods(
            JsonRpcFormatter,
            [], // Обычные методы
            ["serializeRequest", "deserializeResponse", "verificationError", "formatError"] // Статические методы
        )
    ) {
        return console.log(
            "Класс JsonRpcFormatter не существует или не все методы существуют в нем."
        );
    }

    if (!checkErrorClass(NotificationsHtmlError)) {
        return console.log(
            "Класс NotificationsHtmlError не существует или не является наследником Error"
        );
    }

    if (
        !checkClassAndMethods(NotificationsHtml, [
            "addNotification",
            "removeAllNotificationsSequentially",
            "removeNextNotification",
        ])
    ) {
        return console.log(
            "Класс NotificationsHtml не существует или не все методы существуют в нем."
        );
    }

    if (
        !checkClassAndMethods(RequestManager, [
            "addRequest",
            "removeRequestById",
            "findRequestById",
            "getAllRequests",
        ])
    ) {
        return console.log(
            "Класс RequestManager не существует или не все методы существуют в нем."
        );
    }

    if (!checkErrorClass(WebSocketClientError)) {
        return console.log(
            "Класс WebSocketClientError не существует или не является наследником Error"
        );
    }

    if (!checkErrorClass(CardModelError)) {
        return console.log("Класс CardModelError не существует или не является наследником Error");
    }

    if (
        !checkClassAndMethods(
            CardModel,
            ["isCreatedCardElement", "createHtmlShell"], // Обычные методы
            ["setupCardHoverListeners", "showDescription", "hideDescription"] // Статические методы
        )
    ) {
        return console.log("Класс CardModel не существует или не все методы существуют в нем.");
    }

    if (
        !checkClassAndMethods(
            GameControls,
            ["showMainController", "hideMainController", "floatingMainController"], // Обычные методы
            [] // Статические методы
        )
    ) {
        return console.log("Класс GameControls не существует или не все методы существуют в нем.");
    }

    if (
        !checkClassAndMethods(
            CardSelection,
            ["checkElements", "init", "setupCollapseListener"], // Обычные методы
            [] // Статические методы
        )
    ) {
        return console.log("Класс CardSelection не существует или не все методы существуют в нем.");
    }

    if (
        !checkClassAndMethods(
            PlayerHand,
            [
                "checkElements",
                "init",
                "setupFoldListener",
                "setupCollapseListener",
                "setupFullscreenListener",
            ], // Обычные методы
            [] // Статические методы
        )
    ) {
        return console.log("Класс PlayerHand не существует или не все методы существуют в нем.");
    }

    if (
        !checkClassAndMethods(
            GameBoard,
            [
                "checkElements",
                "checkCardTempAreaElements",
                "initAndCreateToContainer",
                "initToContainer",
                "createGameBoard",
                "createCardTempArea",
                "renderUpdatedData",
            ], // Обычные методы
            [] // Статические методы
        )
    ) {
        return console.log("Класс PlayerHand не существует или не все методы существуют в нем.");
    }

    if (
        !checkClassAndMethods(
            BattleZone,
            ["checkElements", "addCardToContainer", "setupDragCardListener", "init"], // Обычные методы
            [] // Статические методы
        )
    ) {
        return console.log("Класс PlayerHand не существует или не все методы существуют в нем.");
    }

    if (typeof websocketClient !== "function") {
        return console.log("Функция websocketClient не существует");
    }

    /****************************************************************/
    const notificationsHtml = new NotificationsHtml("header .notifications");
    const requestManager = new RequestManager();

    const playerHand = new PlayerHand("main .player-hand");
    playerHand.init();
    playerHand.renderUpdatedData();

    const battleZone = new BattleZone("main .battle-zone");
    battleZone.init();
    battleZone.setupDragCardListener(playerHand);

    const cardSelection = new CardSelection("main .game-controls", ".cards-selection");
    cardSelection.init();

    // const tempCard = CardModel.init(1, "default", "../resources/imgs/cards/cardBacks/girl.png");
    // const test123 = document.querySelector("#card-moving-block");
    // test123.prepend(tempCard.cartElement);
    // const gameBoard = new GameBoard();

    const playersFieldElement = document.querySelector("main .players-field");

    // for (let index = 0; index < 50; index++) {
    //     notificationsHtml.addNotification("Тестовое сообщение num: " + index);
    // }
    websocketClient(
        serverIp,
        (data, ws) => {
            try {
                responseServer(
                    requestManager,
                    notificationsHtml,
                    JsonRpcFormatter.deserializeResponse(data),
                    ws
                );
            } catch (error) {
                if (error instanceof JsonRpcFormatterError) {
                    try {
                        requestServer(
                            JsonRpcFormatter.deserializeRequest(data),
                            {
                                cardSelection: cardSelection,
                                playerHand: playerHand,
                                battleZone: battleZone,
                                playersFieldElement: playersFieldElement,
                            },
                            ws
                        );
                    } catch (error) {
                        errorHandler(error, notificationsHtml);
                    }
                } else {
                    errorHandler(error, notificationsHtml);
                }
            }
        },
        (ws) => {
            ws.send(requestManager.addRequest("GetAdminMenu", {}));

            document.addEventListener("sendServer", (event) => {
                const { data, action } = event.detail; // Извлечение параметров
                ws.send(requestManager.addRequest(action, data));
            });
            // sendActionAdminMenu(
            //     requestManager,
            //     ws,
            //     "#admin-menu button"
            // );
        }
    );
}

// Запуск основной логики
document.addEventListener("DOMContentLoaded", () => {
    main();
});
