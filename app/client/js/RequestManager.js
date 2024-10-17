class RequestManager {
    constructor() {
        this.requests = [];
        this.currentId = 1;
    }

    /**
     * Метод для добавления нового запроса.
     * @param {string} method - Имя метода запроса.
     * @param {Object} data - Данные запроса.
     * @returns {string} - Сериализованный запрос.
     */
    addRequest(method, data) {
        const request = {
            id: this.currentId,
            nameMethod: method,
            requestData: data,
            // timestamp: Date.now(),
            // status: "pending",
        };
        this.requests.push(request);
        this.currentId++;

        return JsonRpcFormatter.serializeRequest(method, data, request.id);
    }

    /**
     * Метод для удаления запроса по id и его возврата.
     * @param {number} id - Идентификатор запроса.
     * @returns {Object|null} - Удаленный запрос или null, если запрос не найден.
     */
    removeRequestById(id) {
        const requestIndex = this.requests.findIndex((request) => request.id === id);
        if (requestIndex !== -1) {
            const [removedRequest] = this.requests.splice(requestIndex, 1);
            return removedRequest; // Возвращаем удаленный запрос
        }
        return null; // Возвращаем null, если запрос с таким id не найден
    }

    /**
     * Метод для поиска запроса по id.
     * @param {number} id - Идентификатор запроса.
     * @returns {Object|undefined} - Запрос, если найден, иначе undefined.
     */
    findRequestById(id) {
        return this.requests.find((request) => request.id === id);
    }

    /**
     * Метод для получения всех запросов.
     * @returns {Array} - Массив всех запросов.
     */
    getAllRequests() {
        return this.requests;
    }
}
