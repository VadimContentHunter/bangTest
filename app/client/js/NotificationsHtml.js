class NotificationsHtmlError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotificationsHtml {
    constructor(selectorElement) {
        this.notificationsElement = document.querySelector(selectorElement);
        if (!(this.notificationsElement instanceof HTMLElement)) {
            throw new NotificationsHtmlError("Invalid selector for notifications element");
        }

        this.notificationQueueElement = this.notificationsElement.querySelector("ul");
        if (!(this.notificationQueueElement instanceof HTMLUListElement)) {
            throw new NotificationsHtmlError("Invalid selector for queue element");
        }
    }

    addNotification(message) {
        const notificationItem = document.createElement("li");
        notificationItem.innerHTML = '<span class="notification-text">' + message + "</span>";
        notificationItem.style.display = "flex";
        this.notificationQueueElement.append(notificationItem);

        this.removeAllNotificationsSequentially();
    }

    // Метод для последовательного удаления всех элементов
    removeAllNotificationsSequentially() {
        const notifications = Array.from(this.notificationQueueElement.children); // Получаем все элементы <li>

        console.log(notifications);

        // Если есть элементы, начинаем удаление с первого
        if (notifications.length > 0) {
            this.removeNextNotification(notifications[0]);
        }
    }

    // Метод для удаления элемента и запуска анимации
    removeNextNotification(element) {
        const animationDuration = 5000; // Длительность анимации в миллисекундах
        let animationPlayed = false;

        if (!element.classList.contains("fade-out")) {
            element.classList.add("fade-out");
        }

        if (element.style.display !== "flex") {
            element.style.display = "flex";
        }

        // Устанавливаем таймер на случай, если анимации нет
        const fallbackTimeout = setTimeout(() => {
            if (!animationPlayed) {
                const nextElement = element.nextElementSibling;

                console.log("Анимации не было, удаляем элемент через таймаут");
                element.remove();

                if (nextElement) this.removeNextNotification(nextElement);
            }
        }, animationDuration);

        // Запускаем анимацию и удаляем элемент после её завершения
        element.addEventListener(
            "animationend",
            () => {
                animationPlayed = true;
                clearTimeout(fallbackTimeout); // Очищаем таймер
                const nextElement = element.nextElementSibling;

                element.remove();
                console.log("Элемент удалён по завершению анимации");
                if (nextElement) this.removeNextNotification(nextElement); // Удаляем следующий элемент
            },
            { once: true }
        );
    }
}
