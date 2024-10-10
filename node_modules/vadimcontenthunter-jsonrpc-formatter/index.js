const JsonRpcFormatter = require("./src/JsonRpcFormatter");

const request = JsonRpcFormatter.serializeRequest("add", { a: 5, b: 3 });
console.log(request);
