const BaseManager = require("../base/BaseManager");
const request = require('request');
const ngrok = require('ngrok');
const express = require('express');
const User = require('../classes/User');
const Channel = require("../classes/Channel");

const types = [
    'channel.update', 
    'channel.follow', 
    'channel.raid',
    'stream.online',
    'stream.offline',
    'user.update',
];

class WebhookManager extends BaseManager {

    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        super(client);
        this.api = express();
        this.api.use(express.json());
        this.api.listen(client.port);
        this.__listen();
    }

    async __init() {
        this.url = await ngrok.connect(this.client.port);
        const token = await this.client.__getToken();
        for (const channel of this.client.channels.cache.values()) {
            for (const subType of types) {
                request.get({
                    url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
                    headers: {
                        "client-id": this.client.__clientID,
                        "Authorization": `Bearer ${token}`,
                    },
                    method: 'GET',
                    json: true,
                }, (err, res, body) => {
                    for (const data of body.data) {
                        const { id } = data;
                        request.delete({
                            url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`,
                            headers: {
                                'client-id': 'o17d0nhi84yp19amsbdncik7v81hl9',
                                'Authorization': 'Bearer ' + token
                            },
                            method: 'DELETE',
                            json: true,
                        }, (err, res, body) => {

                        });
                    }
                    request.post({
                        url: `https://api.twitch.tv/helix/eventsub/subscriptions`,
                        headers: {
                            "client-id": this.client.__clientID,
                            "Authorization": `Bearer ${token}`,
                        },
                        json: true,
                        body: {
                            "type": subType,
                            "version": "1",
                            "condition": {
                                "broadcaster_user_id": channel.id,
                                "to_broadcaster_user_id": channel.id,
                                "user_id": channel.id,
                            },
                            "transport": {
                                "method": "webhook",
                                "callback": this.url,
                                "secret": this.client.__clientSecret,
                            }
                        }
                    }, (err, res, body) => {
                    });
                });
            }
        }
    }

    async __listen() {
        const events = require('../utils/events');
        this.api.post('/', async (req, res) => {
            if (req.body.challenge) {
                res.send(req.body.challenge);
            }

            if (req.body.event) {
                const { event } = req.body;
                switch (req.body.subscription.type) {
                    case 'channel.update': {
                        const oldChannel = this.client.channels.cache.get(event.broadcaster_user_id);
                        const newChannel = new Channel(this.client, oldChannel.user, { 
                            title: event.title, language: event.language, game_id: category_id, game_name: category_name, id: event.broadcaster_user_id
                        });
                        this.client.emit(events.CHANNEL_UPDATE, oldChannel, newChannel);
                        this.client.channels.cache.delete(event.broadcaster_user_id);
                        await newChannel.fetch(true);
                        this.client.channels.cache.set(newChannel.id, newChannel);
                        break;
                    }
                    case 'channel.follow': {
                        const user = new User(this.client, { id: event.user_id });
                        await user.fetch(true);
                        const channel = this.client.channels.cache.get(event.broadcaster_user_id);
                        this.client.emit(events.FOLLOW, user, channel);
                        break;
                    }
                    case 'channel.raid': {
                        const raidingUser = new User(this.client, { id: event.from_broadcaster_id });
                        await raidingUser.fetch();
                        const raidingChannel = new Channel(this.client, raidingUser, { id: event.from_broadcaster_id });
                        await raidingChannel.fetch();
                        const channel = this.client.channels.cache.get(event.to_broadcaster_user_id);
                        this.client.emit(events.RAID, raidingChannel, channel)
                        break;
                    }
                    case 'user.update': {
                        const oldUser = this.client.channels.cache.get(event.user_id).user;
                        const newUser = new User(this.client, { id: event.user_id });
                        await newUser.fetch();
                        this.client.emit(events.USER_UPDATE, oldUser, newUser);
                        this.client.channels.cache.get(event.user_id).user = newUser;
                        break;
                    }
                    case 'stream.online': {
                        break;
                    }
                }
            }
        });
    }
}

module.exports = WebhookManager;