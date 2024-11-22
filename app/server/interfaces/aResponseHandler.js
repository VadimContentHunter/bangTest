/**
 * Абстрактный класс aResponseHandler.
 * Этот класс предназначен для создания обработчиков ответов.
 *
 * @abstract
 */
class aResponseHandler {
    constructor() {
        if (new.target === aResponseHandler) {
            throw new TypeError("Нельзя создать экземпляр абстрактного класса");
        }
    }

    /**
     * Метод для получения результата.
     * Этот метод должен быть реализован в подклассах.
     *
     * @abstract
     * @throws {Error} Если метод не реализован в подклассе.
     */
    getResult() {
        throw new Error("Метод 'getResult' должен быть реализован");
    }

    /**
     * Определяет, доступен ли результат для всех клиентов.
     * Этот метод можно переопределить в подклассах, чтобы изменить поведение.
     *
     * @returns {boolean} Возвращает `true`, если результат предназначен для всех клиентов, иначе `false`.
     */
    hasResultForAllClients() {
        return false;
    }

    /**
     * Метод для установки дополнительных параметров.
     * Этот метод должен быть реализован в подклассах.
     *
     * @abstract
     * @throws {Error} Если метод не реализован в подклассе.
     */
    // setParams() {
    //     throw new Error("Метод 'setParams' должен быть реализован");
    // }
}

module.exports = aResponseHandler;
