const ServerError = require("./ServerError");

class HistoryHandlerError extends ServerError {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = HistoryHandlerError;