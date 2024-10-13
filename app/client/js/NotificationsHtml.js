class NotificationsHtmlError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotificationUtils {
    static isHovered = false;
    static animationDuration = 5000;
    static animationPlayed = false;

    static onMouseEnter(element, fallbackTimeout) {
        element.addEventListener("mouseenter", () => {
            NotificationUtils.isHovered = true;
            if (element.classList.contains("fade-out")) {
                element.classList.remove("fade-out");
            }

            clearTimeout(fallbackTimeout.value);
        });
    }

    static onMouseLeave(element, fallbackTimeout) {
        element.addEventListener("mouseleave", () => {
            NotificationUtils.isHovered = false;
            if (!element.classList.contains("fade-out")) {
                element.classList.add("fade-out");
            }

            fallbackTimeout.value = setTimeout(() => {
                if (NotificationUtils.isHovered) return;
                if (!NotificationUtils.animationPlayed) {
                    NotificationUtils.removeElement(
                        element,
                        this.removeNextNotification.bind(this)
                    );
                }
            }, NotificationUtils.animationDuration);
        });
    }

    static removeElement(element, removeNextNotification) {
        const nextElement = element.nextElementSibling;
        element.remove();
        if (nextElement) {
            removeNextNotification(nextElement);
        }
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

    removeAllNotificationsSequentially() {
        const notifications = Array.from(this.notificationQueueElement.children);

        if (notifications.length > 0) {
            this.removeNextNotification(notifications[0]);
        }
    }

    removeNextNotification(element) {
        if (!element.classList.contains("fade-out")) {
            element.classList.add("fade-out");
        }

        const fallbackTimeout = {
            value: setTimeout(() => {
                if (NotificationUtils.isHovered) return;
                if (!NotificationUtils.animationPlayed) {
                    NotificationUtils.removeElement(
                        element,
                        this.removeNextNotification.bind(this)
                    );
                }
            }, NotificationUtils.animationDuration),
        };

        NotificationUtils.onMouseEnter(element, fallbackTimeout);
        NotificationUtils.onMouseLeave(element, fallbackTimeout);

        element.addEventListener(
            "animationend",
            () => {
                if (NotificationUtils.isHovered) return;

                NotificationUtils.animationPlayed = true;
                clearTimeout(fallbackTimeout.value);
                NotificationUtils.removeElement(element, this.removeNextNotification.bind(this));
            },
            { once: true }
        );
    }
}
