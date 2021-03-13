const Game = require('./Game');
const Base = require("../base/Base");
const Channel = require('./Channel');
const User = require('./User');

class Stream extends Base {
    /**
     * 
     * @param {Client} client 
     * @param {Channel} channel 
     * @param {*} data 
     */
    constructor(client, channel, data) {
        super(client);
        this.channel = channel;

        /**
         * @type {number}
         */
        this.viewers = data.viewer_count;

        /**
         * @type {string}
         */
        this.title = data.title;

        /**
         * @type {string}
         */
        this.thumbnailURL = `${data.thumbnail_url.replace('{width}', '440').replace('{height}', '248')}?r=${Math.floor(Math.random() * 999999)}`;

        /**
         * @type {string[]}
         */
        this.tags = data.tag_ids;

        /**
         * @type {string}
         */
        this.id = data.id;

        /**
         * @type {string}
         */
        this.userID = data.user_id;

        if (channel) {
            this.game = channel.game;
            this.user = channel.user;
        } else {
            this.game = new Game(client, { id: data.game_id, name: data.game_name });
            this.game.fetch();
            this.user = new User(client, { id: data.user_id });
            this.user.fetch();
        }
        this.startedAt = new Date(data.started_at);
    }

    /**
     * 
     * @param {string} id 
     * @param {boolean} force 
     * @returns 
     */
    async fetch(force) {
        if (force || !this.id) {
            const response = await this.client.fetch(`https://api.twitch.tv/helix/streams?user_id=${this.userID}`);
            if (response && response.data) {
                const data = response.data.find(d => d.user_id === this.id);
                if (data) {
                    this.viewers = data.viewer_count;
                    this.title = data.title;
                    this.thumbnailURL = `${data.thumbnail_url.replace('{width}', '440').replace('{height}', '248')}?r=${Math.floor(Math.random() * 999999)}`;
                    this.tags = data.tag_ids;
                    this.id = data.id;
                }
            }
        }
        if (!this.channel) {
            this.user = new User(this.client, { id: this.userID });
            await this.user.fetch(force);
            this.channel = new Channel(this.client, user, { broadcaster_id: this.userID });
            await this.channel.fetch(force);
        }
        return this;
    }
}

module.exports = Stream;