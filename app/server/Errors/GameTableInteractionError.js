const ServerError = require("./ServerError");

class GameTableInteractionError extends ServerError {
    constructor(message, card = null) {
        super(message);
        this.name = this.constructor.name;
        this.card = card;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = GameTableInteractionError;
