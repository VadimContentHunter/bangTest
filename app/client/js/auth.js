const selectorStaticNotification = "main .static-notifications ul";
const StaticNotificationStatusClasses = {
    SUCCESS: "success-notification",
    WARNING: "warning-notification",
    ERROR: "error-notification",
};
let idRequest = 0;

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

/**
 * Добавляет новое статическое уведомление в список.
 *
 * @param {string} selector - Селектор списка уведомлений, в который будет добавлено уведомление.
 * @param {string} message - Сообщение уведомления.
 * @param {string} [className] - (Опционально) Класс, который будет добавлен к элементу уведомления.
 * @returns {void}
 * @example
 * addStaticNotification('#notification-list', 'Успех!', 'success-notification');
 */
function addStaticNotification(selector, message, className) {
    const notificationList = document.querySelector(selector);
    if (!(notificationList instanceof HTMLElement)) {
        console.error("Notification list not found");
        return; // Выходим из функции, если элемент не найден
    }

    // Создаем новый элемент уведомления
    const notificationItem = document.createElement("li");
    notificationItem.textContent = message; // Устанавливаем текст уведомления
    if (className) {
        notificationItem.classList.add(className); // Добавляем класс, если он указан
    }

    notificationList.appendChild(notificationItem); // Добавляем элемент уведомления в список
}

/**
 * Очищает все статические уведомления в списке.
 *
 * @param {string} selector - Селектор списка уведомлений, который будет очищен.
 * @returns {void}
 * @example
 * clearStaticNotifications('#notification-list');
 */
function clearStaticNotifications(selector) {
    const notificationList = document.querySelector(selector);
    if (!(notificationList instanceof HTMLElement)) {
        console.error("Notification list not found");
        return; // Выходим из функции, если элемент не найден
    }

    // Удаляем все дочерние элементы (уведомления)
    while (notificationList.firstChild) {
        notificationList.removeChild(notificationList.firstChild);
    }
}

function sendForm(ws, selectorForm, selectorButtonSend) {
    const form = document.querySelector(selectorForm);
    if (!(form instanceof HTMLFormElement)) {
        console.error("Form not found");
        return; // Выходим из функции, если элемент не найден
    }

    const buttonSend = document.querySelector(selectorButtonSend);
    if (!(buttonSend instanceof HTMLButtonElement)) {
        console.error("Button send not found");
        return; // Выходим из функции, если элемент не найден
    }

    const inputs = form.querySelectorAll("input");
    if (!(inputs instanceof NodeList)) {
        console.error("Inputs not found");
        return; // Выходим из функции, если элементы не найдены
    }

    buttonSend.addEventListener("click", (e) => {
        e.preventDefault(); // Отменяем стандартное поведение формы

        let data = {};
        inputs.forEach((input) => {
            if (input.value && input.name) {
                data[input.name] = input.value;
            }
        });

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JsonRpcFormatter.serializeRequest("authorization", data, ++idRequest));
        } else {
            console.error("WebSocket соединение не установлено.");
        }
    });
}

function updateSessionId({ sessionId, maxAge, path }) {
    if(!sessionId || !maxAge || !path) {
        throw new Error("Не удалось обновить сессию");
    }

    document.cookie = `sessionId=${sessionId}; max-age=${maxAge}; path=${path};`;
}

function responseServer(response) {
    clearStaticNotifications(selectorStaticNotification);
    addStaticNotification(
        selectorStaticNotification,
        "Имя должно содержать только латинские буквы (A-Za-z).",
        StaticNotificationStatusClasses.WARNING
    );
    if (response.result) {
        console.log(response.result);

        // notificationsHtml.addNotification(response.result);
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
        default:
            throw new Error("Неизвестный запрос от сервера: " + response);
            // console.error("Неизвестный запрос от сервера:", response);
    }
}

function errorHandler(error, notificationsHtml) {
    if (!(notificationsHtml instanceof NotificationsHtml)) {
        console.error("Объект notificationsHtml не является экземпляром NotificationsHtml");
    }else {
        notificationsHtml.addNotification(error.message);
    }

    clearStaticNotifications(selectorStaticNotification);
    addStaticNotification(
        selectorStaticNotification,
        error.message,  
        StaticNotificationStatusClasses.ERROR
    );
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

    if (!checkErrorClass(WebSocketClientError)) {
        return console.log(
            "Класс WebSocketClientError не существует или не является наследником Error"
        );
    }

    if (typeof websocketClient !== "function") {
        return console.log("Функция websocketClient не существует");
    }

    // Инициализация класса NotificationsHtml и работа с WebSocket
    const notificationsHtml = new NotificationsHtml("header .notifications");
    // for (let index = 0; index < 50; index++) {
    //     notificationsHtml.addNotification("Тестовое сообщение num: " + index);
    // }
    websocketClient(
        serverIp,
        (data) => {
            try {
                responseServer(JsonRpcFormatter.deserializeResponse(data));
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
            sendForm(ws, "main form.form-login-system", "main form.form-login-system button");
        }
    );
}

// Запуск основной логики
document.addEventListener("DOMContentLoaded", () => {
    main();
});
