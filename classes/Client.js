const EventEmitter = require("events");
const request = require('request');
const ChannelManager = require("../managers/ChannelManager");
const WebhookManager = require("../managers/WebhookManager");
const Channel = require('./Channel');
const User = require("./User");

class Client extends EventEmitter {
    constructor(options) {
        super();
        
        this.channels = new ChannelManager(this);

        /**
         * @private
         * @type {string}
         */
        this.__clientID = options.client_id;

        /**
         * @private
         * @type {string}
         */
        this.__clientSecret = options.client_secret;

        this.port = options.port || 3000;

        this.__init(options);
    }

    /**
     * 
     * @param {string} url
     */
    async fetch(url) {
        return new Promise(async (resolve, reject) => {
            const token = await this.__getToken();
            const options = {
                url,
                method: 'GET',
                headers: {
                    'client-id': this.__clientID,
                    'Authorization': 'Bearer ' + token
                }
            };
            request.get(options, (err, res, body) => {
                if (err) {
                    resolve(undefined);
                } else {
                    if (body.startsWith('{') && body.endsWith('}')) {
                        resolve(JSON.parse(body));
                    } else {
                        resolve(undefined);
                    }
                }
            });
        });
    }

    /**
     * @private
     */
    async __getToken() {
        return new Promise(async (resolve, reject) => {
            const options = {
                url: "https://id.twitch.tv/oauth2/token",
                json: true,
                body: {
                    client_id: this.__clientID,
                    client_secret: this.__clientSecret,
                    grant_type: 'client_credentials'
                }
            };
            request.post(options, (err, res, body) => {
                if (err) {
                    throw new Error('Invalid client ID and client secret');
                } else {
                    resolve(res.body.access_token);
                }
            });
        });
    }

    /**
     * @private
     */
    async __init(options) {
        const promise = new Promise(async (resolve, reject) => {
            for (const channelName of options.channels) {
                const search = await this.fetch(`https://api.twitch.tv/helix/search/channels?query=${channelName.toLowerCase()}`);
                if (search && search.data) {
                    const data = search.data.find(d => d.broadcaster_login.toLowerCase() === channelName.toLowerCase());
                    if (data) {
                        const user = new User(this, { id: data.id });
                        const channel = new Channel(this, user, { broadcaster_id: data.id });
                        this.channels.cache.set(channel.id, channel);
                        await channel.fetch(true);
                    }
                }
                if (channelName === options.channels[options.channels.length-1]) resolve();
            }
        });
        promise.then(() => {
            this.webhook = new WebhookManager(this);
            this.webhook.__init();
        });
    }
}

module.exports = Client;