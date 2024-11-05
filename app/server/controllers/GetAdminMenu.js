const aResponseHandler = require("../interfaces/aResponseHandler");
const AdminMenuHandler = require("../handlers/AdminMenuHandler");
const AdminMenuError = require("../Errors/AdminMenuError");

class GetAdminMenu extends aResponseHandler {
    constructor(params) {
        super();
        this.adminMenuHandler = new AdminMenuHandler(params?.sessionId);

        // this.playroomHandler = params?.playroomHandler;
        // this.playroomHandler.connect(this.sessionId);

        // params.myHooks.emit("updateUserCount");
    }

    getResult() {
        let result = this.adminMenuHandler.getAdminMenuTemplate();
        return result === "" ? null : result;
    }
}

module.exports = GetAdminMenu;
