const Base = require('../base/Base');

class User extends Base {

    /**
     * 
     * @param {Client} client 
     * @param {*} data 
     */
    constructor(client, data) {
        super(client)

        /**
         * @type {string}
         */
        this.streamerType = data.broadcaster_type;

        /**
         * @type {string}
         */
        this.description = data.description;

        /**
         * @type {string}
         */
        this.displayName = data.display_name;

        /**
         * @type {string}
         */
        this.id = data.id;

        /**
         * @type {string}
         */
        this.loginName = data.login;

        /**
         * @type {string}
         */
        this.profileURL = data.profile_image_url;

        /**
         * @type {string}
         */
        this.type = data.type;

        /**
         * @type {number}
         */
        this.views = data.view_count;

        /**
         * @type {Date}
         */
        this.createdAt = new Date(data.created_at);
    }

    /**
     * 
     * @param {boolean} force 
     */
    async fetch(force) {
        if (force || !this.displayName) {
            const response = await this.client.fetch(`https://api.twitch.tv/helix/users?id=${this.id}`);
            if (response && response.data) {
                const data = response.data.find(d => d.id === this.id);
                if (data) {
                    this.streamerType = data.broadcaster_type;
                    this.description = data.description;
                    this.displayName = data.display_name;
                    this.loginName = data.login;
                    this.profileURL = data.profile_image_url;
                    this.type = data.type;
                    this.views = data.view_count;
                    this.createdAt = new Date(data.created_at);
                }
            }
        }
        return this;
    }
}

module.exports = User;