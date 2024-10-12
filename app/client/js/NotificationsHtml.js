class NotificationsHtmlError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotificationUtils {
    static applyFadeOut(element) {
        if (!element.classList.contains("fade-out")) {
            element.classList.add("fade-out");
        }
    }

    static onMouseEnter(element, setHovered) {
        setHovered();
        element.classList.remove("fade-out");
    }

    static onMouseLeave(element, setHovered) {
        setHovered();
        NotificationUtils.applyFadeOut(element);
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
        const animationDuration = 5000;
        let animationPlayed = false;
        let isHovered = false;

        NotificationUtils.applyFadeOut(element);

        element.addEventListener("mouseenter", () =>
            NotificationUtils.onMouseEnter(element, () => (isHovered = true))
        );
        element.addEventListener("mouseleave", () =>
            NotificationUtils.onMouseLeave(element, () => (isHovered = false))
        );

        const fallbackTimeout = setTimeout(() => {
            if (isHovered) return;
            if (!animationPlayed) {
                NotificationUtils.removeElement(element, this.removeNextNotification.bind(this));
            }
        }, animationDuration);

        element.addEventListener(
            "animationend",
            () => {
                if (isHovered) return;

                animationPlayed = true;
                clearTimeout(fallbackTimeout);
                NotificationUtils.removeElement(element, this.removeNextNotification.bind(this));
            },
            { once: true }
        );
    }
}
