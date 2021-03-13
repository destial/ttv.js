const Base = require('../base/Base');
const User = require('./User');
const Game = require('./Game');
const Stream = require('./Stream');

class Channel extends Base {

    /**
     * 
     * @param {Client} client 
     * @param {User | PartialUser} user
     * @param {*} data
     */
    constructor(client, user, data) {
        super(client);
        this.user = user;

        /**
         * @type {string}
         */
        this.id = data.broadcaster_id;

        /**
         * @type {string}
         */
        this.name = data.broadcaster_name;

        /**
         * @type {game}
         */
        this.game = new Game(client, { id: data.game_id, name: data.game_name });
        
        /**
         * @type {string}
         */
        this.title = data.title;
        
        /**
         * @type {string}
         */
        this.language = data.broadcaster_language;
        
        /**
         * @type {Stream}
         */
        this.stream = undefined;
    }

    /**
     * 
     * @param {boolean} force 
     */
    async fetch(force) {
        if (force || !this.name) {
            const response = await this.client.fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${this.id}`);
            if (response && response.data) {
                const data = response.data.find(d => d.broadcaster_id === this.id);
                if (data) {
                    this.id = data.broadcaster_id;
                    this.name = data.broadcaster_name;
                    this.game = new Game(this.client, { id: data.game_id, name: data.game_name });
                    this.title = data.title;
                    this.language = data.broadcaster_language;
                    await this.game.fetch(true);
                    const existing = this.client.channels.cache.has(this.id);
                    if (!existing) {
                        this.client.channels.cache.set(this.id, this);
                    }
                }
            }
        }
        if (!this.user) {
            this.user = new User(this.client, { id: this.id });
        }
        await this.user.fetch(true);
        return this;
    }
}

module.exports = Channel;