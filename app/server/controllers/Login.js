const ServerError = require("../Errors/ServerError");
const AuthHandler = require("../handlers/AuthHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const GameHandler = require("../handlers/GameHandler");

class Login extends aResponseHandler {
    constructor(params) {
        super();
        console.log("Login:", params);

        this.sessionId = params?.sessionId;
        this.userName = params?.user_name;
        this.gameHandler = params?.gameHandler;
        this.isStatusLogin = false;

        this.authenticate();
    }

    authenticate() {
        const authHandler = new AuthHandler(this.userName, this.sessionId, this.gameHandler);
        this.isStatusLogin = authHandler.Authentication() && authHandler.Authorization();
    }

    getResult() {
        return {
            isStatusLogin: this.isStatusLogin,
        };
    }
}

module.exports = Login;
