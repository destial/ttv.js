module.exports = {
    Channel: require('./classes/Channel'),

    User: require('./classes/User'),

    Game: require('./classes/Game'),

    Client: require('./classes/Client'),
    Base: require('./base/Base'),

    BaseManager: require('./base/BaseManager'),
    ChannelManager: require('./managers/ChannelManager'),
    WebhookManager: require('./managers/WebhookManager'),
    StreamManager: require('./managers/StreamManager'),
}