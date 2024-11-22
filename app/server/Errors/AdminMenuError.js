const ServerError = require("./ServerError");

class AdminMenuError extends ServerError {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AdminMenuError;