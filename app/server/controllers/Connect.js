const ServerError = require("../Errors/ServerError");
const AuthHandler = require("../handlers/AuthHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const PlayroomHandler = require("../handlers/PlayroomHandler");

class Connect extends aResponseHandler {
    constructor(params) {
        super();
        console.log("Connect:", params);

        this.sessionId = params?.sessionId;
        this.playroomHandler = params?.playroomHandler;
    }

    getResult() {
        return null;
    }
}

module.exports = Connect;
