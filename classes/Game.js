const Base = require("../base/Base");

class Game extends Base {

    /**
     * 
     * @param {Client} client 
     * @param {*} data
     */
    constructor(client, data) {
        super(client);

        /**
         * @type {string}
         */
        this.name = data.name;

        /**
         * @type {string}
         */
        this.id = data.id;

        /**
         * @type {string}
         */
        this.boxArtURL = data.bot_art_url;
    }

    /**
     * 
     * @param {boolean} force 
     * @returns 
     */
    async fetch(force) {
        if (force || !this.boxArtURL) {
            const data = await this.client.fetch(`https://api.twitch.tv/helix/games?id=${this.id}`);
            if (data && data.data) {
                const game = data.data.find(d => d.id === this.id);
                if (game) {
                    this.name = game.name;
                    this.boxArtURL = game.bot_art_url;
                }
            }
        }
        return this;
    }
}

module.exports = Game;