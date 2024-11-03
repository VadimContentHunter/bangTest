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
        (data) => {
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
            // sendForm(
            //     requestManager,
            //     ws,
            //     "main form.form-login-system",
            //     "main form.form-login-system button"
            // );
        }
    );
}

// Запуск основной логики
document.addEventListener("DOMContentLoaded", () => {
    main();
});