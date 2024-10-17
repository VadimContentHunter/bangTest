const ServerError = require("../Errors/ServerError");
const AuthHandler = require("../handlers/AuthHandler");

class Login {
    constructor(params) {
        this.isStatusLogin = false;
        console.log("Login:", params);

        let authHandler = new AuthHandler(params?.user_name);
        if (authHandler.Authentication()) {
            if (authHandler.Authentication()) {
                this.isStatusLogin = true;
            }
        }
    }

    getResult() {
        return {
            isStatusLogin: this.isStatusLogin,
        };
    }
}

module.exports = Login;
