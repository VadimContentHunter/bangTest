const ServerError = require("../Errors/ServerError");
const AuthHandler = require("../handlers/AuthHandler");
const aResponseHandler = require("../interfaces/aResponseHandler");
const PlayroomHandler = require("../handlers/PlayroomHandler");

class Login extends aResponseHandler {
    constructor(params) {
        super();
        console.log("Login:", params);

        this.sessionId = params?.sessionId;
        this.userName = params?.user_name;
        this.code = params?.code;
        this.playroomHandler = params?.playroomHandler;
        this.isStatusLogin = false;

        this.authenticate();
    }

    authenticate() {
        const authHandler = new AuthHandler(
            this.userName,
            this.code,
            this.sessionId,
            this.playroomHandler
        );
        this.isStatusLogin = authHandler.Authentication() && authHandler.Authorization();
    }

    getResult() {
        return {
            isStatusLogin: this.isStatusLogin,
        };
    }
}

module.exports = Login;
