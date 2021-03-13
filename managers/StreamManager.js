const BaseManager = require("../base/BaseManager");
const Channel = require("../classes/Channel");
const Stream = require("../classes/Stream");

class StreamManager extends BaseManager {
    constructor(client) {
        super(client);

        /**
         * @type {Map<string, Stream>}
         */
        this.cache = new Map();
    }

    /**
     * 
     * @param {string} id 
     * @param {boolean} force
     */
    async fetch(id, force) {
        if (id) {
            const stream = this.cache.get(id);
            if (stream) {
                await stream.fetch(force);
            } else {
                const response = await this.client.fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${id}`);
                if (response && response.data) {
                    const data = response.data.find(d => d.broadcaster_id === id);
                    if (data) {
                        const channel = new Channel(this.client, undefined, data);
                        await channel.fetch(force);
                        const stream = new Stream(this.client, channel, { user_id: id });
                        await stream.fetch(force);
                    }
                }
            }
        } else {
            this.cache.forEach(async stream => {
                await stream.fetch(force);
            });
        }
        return this;
    }
}

module.exports = StreamManager;