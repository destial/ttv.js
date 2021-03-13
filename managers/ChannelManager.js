const BaseManager = require("../base/BaseManager");
const Channel = require("../classes/Channel");

class ChannelManager extends BaseManager {

    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        super(client);

        /**
         * @type {Map<string, Channel>}
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
            const channel = this.cache.get(id);
            if (channel) {
                await channel.fetch(force);
            } else {
                const response = await this.client.fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${id}`);
                if (response && response.data) {
                    const data = response.data.find(d => d.broadcaster_id === id);
                    if (data) {
                        const channel = new Channel(this.client, undefined, data);
                        await channel.fetch(force);
                    }
                }
            }
        } else {
            this.cache.forEach(async channel => {
                await channel.fetch(force);
            });
        }
        return this;
    }
}

module.exports = ChannelManager;