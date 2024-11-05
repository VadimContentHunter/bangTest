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

    // const userCountElement = document.querySelector(selector);
    // if (!(userCountElement instanceof HTMLElement)) {
    //     throw new Error("Не удалось найти элемент для кол-ва игроков онлайн.");
    // }

    // userCountElement.innerText = quantity;
}

function eventActivatedMenu(selectorElementClick, selectorElementMenu) {
    const menuElement = document.querySelector(selectorElementMenu);
    if (!(menuElement instanceof HTMLElement)) {
        throw new Error("Не удалось найти меню");
    }

    const clickElements = document.querySelector(selectorElementClick);
    if (!(clickElements instanceof HTMLElement)) {
        throw new Error("Не удалось найти элементы для клика");
    }

    clickElements.addEventListener("click", (event) => {
        event.preventDefault();
        menuElement.classList.toggle("activate");
    });
}

/**=============================================================================================**/

function responseServer(requestManager, notificationsHtml, response) {
    if (!(notificationsHtml instanceof NotificationsHtml)) {
        console.error("Объект notificationsHtml не является экземпляром NotificationsHtml");
        throw new Error("Не удалось обработать ответ.");
    }

    if (!(requestManager instanceof RequestManager)) {
        throw new Error("requestManager not instanceof RequestManager");
    }

    if (response.result) {
        if (typeof response.id === "number") {
            const requestItem = requestManager.removeRequestById(response.id);
            switch (requestItem?.nameMethod) {
                // case "Login":
                //     let message = "Ура удалось пройти аутентификацию и авторизацию!!";
                //     notificationsHtml.addNotification(message);
                //     addStaticNotification(
                //         selectorStaticNotification,
                //         message,
                //         StaticNotificationStatusClasses.SUCCESS
                //     );
                //     window.location.href = "/playroom";
                //     break;
                default:
                    throw new Error("Id ответа не найден в списке запросов. id: " + response.id);
            }
        } else if (response.id === null) {
        } else {
            console.error("response id not corrected");
            return;
        }
    } else if (response.error) {
        const error = JsonRpcFormatter.verificationError(response.error);
        throw new Error(error.message);
    } else {
        console.error("Неизвестный ответ:", response);
    }
}

function requestServer(request) {
    switch (request.method) {
        case "updateSessionId":
            updateSessionId(request?.params);
            break;
        case "updateUserCount":
            updateUserCount(request?.params, "#user-count");
            break;
        default:
            throw new Error("Неизвестный запрос от сервера: " + response);
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

// function sendActionAdminMenu(requestManager, ws, selectorButtonSend) {
//     if (!(requestManager instanceof RequestManager)) {
//         console.error("requestManager not instanceof RequestManager");
//         return;
//     }

//     const buttonSend = document.querySelector(selectorButtonSend);
//     if (!(buttonSend instanceof HTMLElement)) {
//         console.error("Button send not found");
//         return;
//     }

//     if (!buttonSend.hasAttribute("data")) {
//         console.error("The button does not have a data attribute.");
//         return;
//     }

//     buttonSend.addEventListener("click", (e) => {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(
//                 requestManager.addRequest("adminMenu", {
//                     data: buttonSend.getAttribute("data"),
//                 })
//             );
//         } else {
//             console.error("WebSocket соединение не установлено.");
//         }
//     });
// }

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

    if (typeof websocketClient !== "function") {
        return console.log("Функция websocketClient не существует");
    }

    /****************************************************************/
    const notificationsHtml = new NotificationsHtml("header .notifications");
    const requestManager = new RequestManager();

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
                    JsonRpcFormatter.deserializeResponse(data)
                );
            } catch (error) {
                if (error instanceof JsonRpcFormatterError) {
                    try {
                        requestServer(JsonRpcFormatter.deserializeRequest(data));
                    } catch (error) {
                        errorHandler(error, notificationsHtml);
                    }
                } else {
                    errorHandler(error, notificationsHtml);
                }
            }
        },
        (ws) => {
            ws.send(requestManager.addRequest("connect", {}));
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
    eventActivatedMenu(
        ".menu-line-mini .setting-room .base-icon-medium",
        ".menu-line-mini .setting-room"
    );
    main();
});
