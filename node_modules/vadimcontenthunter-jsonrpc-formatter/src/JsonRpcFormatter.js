class JsonRpcFormatterError extends Error {
    constructor(message) {
        super(message);
        this.name = "JsonRpcFormatterError";
    }
}

class JsonRpcFormatter {
    /**
     * Serializes a JSON-RPC request object into a JSON string.
     * Сериализует объект JSON-RPC в строку JSON.
     *
     * @param {string} method - The name of the method to be invoked. Имя вызываемого метода.
     * @param {object|array} [params] - A structured value that contains the parameters to be used in the method call. This member MAY be omitted. Структурированное значение, содержащее параметры для вызова метода. Этот член МОЖЕТ быть опущен.
     * @param {number|string|null} [id=null] - An optional identifier for the request. Необязательный идентификатор запроса.
     * @returns {string} - The JSON-RPC request as a string. Строка, представляющая JSON-RPC запрос.
     *
     * @throws {JsonRpcFormatterError} - If the method is not a string or the params are not an object or array. Если метод не является строкой или параметры не являются объектом или массивом.
     *
     * @example
     * const request = JsonRpcFormatter.serializeRequest("add", { a: 5, b: 3 });
     * console.log(request); // Output: {"jsonrpc":"2.0","method":"add","params":{"a":5,"b":3},"id":null}
     */
    static serializeRequest(method, params = undefined, id = null) {
        if (typeof method !== "string") {
            throw new JsonRpcFormatterError("Method must be a string");
        }
        if (
            params !== undefined &&
            !(typeof params === "object" && params !== null) &&
            !Array.isArray(params)
        ) {
            throw new JsonRpcFormatterError(
                "Params must be an object or array if provided"
            );
        }

        return JSON.stringify({
            jsonrpc: "2.0",
            method,
            params, // If params is undefined, it will be omitted in the JSON string
            id,
        });
    }

    /**
     * Deserializes a JSON-RPC response string into a JavaScript object.
     * Десериализует строку ответа JSON-RPC в объект JavaScript.
     *
     * @param {string} response - The JSON-RPC response string to be deserialized.
     *                          - Строка ответа JSON-RPC, которая должна быть десериализована.
     * @returns {object} - The parsed JSON-RPC response as an object.
     *                   - Разобранный ответ JSON-RPC в виде объекта.
     *
     * @throws {JsonRpcFormatterError} - If the response is not a valid JSON, the JSON-RPC version is missing or invalid, the `id` is invalid, or neither `result` nor `error` is present.
     *                                   Если ответ не является допустимым JSON, версия JSON-RPC отсутствует или неверна, `id` неверен, или отсутствуют оба свойства: `result` и `error`.
     *
     * @example
     * const response = '{"jsonrpc":"2.0","result":{"sum":8},"id":1}';
     * const parsedResponse = JsonRpcFormatter.deserializeResponse(response);
     * console.log(parsedResponse); // Output: { jsonrpc: "2.0", result: { sum: 8 }, id: 1 }
     */
    static deserializeResponse(response) {
        try {
            const parsedResponse = JSON.parse(response);

            // Check if parsed response is an object
            if (typeof parsedResponse !== "object" || parsedResponse === null) {
                throw new JsonRpcFormatterError("parsedResponse is not object");
            }

            // Check if the JSON-RPC version is valid
            if (!parsedResponse.jsonrpc || parsedResponse.jsonrpc !== "2.0") {
                throw new JsonRpcFormatterError(
                    "Invalid or missing JSON-RPC version"
                );
            }

            // Check if the id is valid (if it exists)
            if (parsedResponse.id !== null && isNaN(parsedResponse.id)) {
                throw new JsonRpcFormatterError("Invalid id");
            }

            // Ensure that either result or error is present
            if (!parsedResponse.result && !parsedResponse.error) {
                throw new JsonRpcFormatterError(
                    "Missing property result or error"
                );
            }

            // If result exists, ensure it's not undefined (and handle error validation if error exists)
            if (
                parsedResponse.hasOwnProperty("result") &&
                typeof parsedResponse.result !== "undefined"
            ) {
                throw new JsonRpcFormatterError(
                    "Invalid or missing property result"
                );
            }

            // Check for errors in the response (if error property exists)
            if (parsedResponse.hasOwnProperty("error")) {
                JsonRpcFormatter.verificationError(parsedResponse?.error);
            }

            return parsedResponse;
        } catch (error) {
            throw new JsonRpcFormatterError("Invalid JSON-RPC response format");
        }
    }

    /**
     * Verifies the structure of an error object in a JSON-RPC response.
     * Проверяет структуру объекта ошибки в ответе JSON-RPC.
     *
     * @param {object} error - The error object to be verified. Объект ошибки, который нужно проверить.
     * @throws {JsonRpcFormatterError} - If the error is not an object, or the `code` is missing or not a number, or the `message` is missing or not a string.
     *                                   Если ошибка не является объектом, либо отсутствует или неверный `code`, либо отсутствует или неверное `message`.
     * @returns {object} - Returns the error object if it is valid. Возвращает объект ошибки, если он действителен.
     *
     * @example
     * const errorResponse = { code: -32601, message: "Method not found" };
     * JsonRpcFormatter.verificationError(errorResponse); // No error, returns the error object
     *
     * const invalidErrorResponse = { code: "string", message: 123 };
     * JsonRpcFormatter.verificationError(invalidErrorResponse); // Throws JsonRpcFormatterError: "Invalid error.code"
     */
    static verificationError(error) {
        if (typeof error !== "object" || error === null) {
            throw new JsonRpcFormatterError("error is not object");
        }

        if (!error.hasOwnProperty("code") || typeof error?.code !== "number") {
            throw new JsonRpcFormatterError("Invalid error.code");
        }

        if (
            !error.hasOwnProperty("message") ||
            typeof error?.message !== "string"
        ) {
            throw new JsonRpcFormatterError("Invalid error.message");
        }

        return error;
    }

    /**
     * Formats an error response in JSON-RPC format.
     * Форматирует ответ об ошибке в формате JSON-RPC.
     *
     * @param {number} code - The error code.
     *                      - Код ошибки.
     * @param {string} message - The error message.
     *                         - Сообщение об ошибке.
     * @param {number|string|null} [id=null] - An optional identifier for the request.
     *                                       - Необязательный идентификатор запроса.
     * @returns {string} - The JSON-RPC formatted error response as a string.
     *                   - Строка, представляющая ответ об ошибке в формате JSON-RPC.
     *
     * @example
     * const errorResponse = JsonRpcFormatter.formatError(-32601, "Method not found");
     * console.log(errorResponse);
     * // Output: '{"jsonrpc":"2.0","error":{"code":-32601,"message":"Method not found"},"id":null}'
     */
    static formatError(code, message, id = null) {
        return JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code,
                message,
            },
            id,
        });
    }
}

// Экспортируем класс для CommonJS и модулей ES
if (typeof module !== "undefined" && module.exports) {
    // Node.js или CommonJS
    module.exports = JsonRpcFormatter;
} else if (typeof define === "function" && define.amd) {
    // RequireJS (для браузера)
    define(function () {
        return JsonRpcFormatter;
    });
} else {
    // Глобальная переменная для браузера (UMD)
    window.JsonRpcFormatter = JsonRpcFormatter;
}
