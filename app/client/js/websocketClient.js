class WebSocketClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

function websocketClient(ip, callbackHandlerResponse, callbackHandlerRequest) {
    if (typeof ip !== "string") {
        throw new WebSocketClientError(
            "Invalid IP address for websocket client"
        );
    }

    if (typeof callbackHandlerResponse !== "function") {
        throw new WebSocketClientError(
            "Invalid callbackHandlerResponse for websocket client"
        );
    }

    if (typeof callbackHandlerRequest !== "function") {
        throw new WebSocketClientError(
            "Invalid callbackHandlerRequest for websocket client"
        );
    }

    const ipPortPattern = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    if (!ipPortPattern.test(ip)) {
        throw new WebSocketClientError(
            "Параметр ip не соответствует шаблону (123.123.123.123:12345)"
        );
    }

    const ws = new WebSocket("ws://" + ip);
    ws.onopen = () => {
        console.log("Соединение установлено с сервером");
    };

    ws.onmessage = (event) => {
        callbackResponse(event.data);
    };

    ws.onclose = () => {
        console.log("Соединение закрыто");
    };

    callbackRequest(wp);
}
