class BaseManager {

    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        this.client = client;

        /**
         * @type {Map<string, any>}
         */
        this.cache = new Map();
    }
}

module.exports = BaseManager;