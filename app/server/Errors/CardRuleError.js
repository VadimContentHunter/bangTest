const ServerError = require("./ServerError");

class CardRuleError extends ServerError {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = CardRuleError;