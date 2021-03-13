declare module 'ttv.js' {
    export class Client {
        constructor(ClientOptions: ClientOptions);
        channels: ChannelManager;
        webhook: WebhookManager;
    }

    export class Base {
        constructor(client: Client);
        client: Client;
    }

    export class BaseManager {
        constructor(client: Client);
        client: Client;
        cache: Map<any, any>;
    }

    export class ChannelManager extends BaseManager {
        constructor(client: Client);
        client: Client;
        cache: Map<string, Channel>;

        fetch(id: string, force: boolean): Promise<ChannelManager>;
    }

    export class WebhookManager extends BaseManager {
        constructor(client: Client);
        client: Client;
        api: Express.Application;
        url: string;
    }

    export class StreamManager extends BaseManager {
        constructor(client: Client);
        cache: Map<string, Stream>;
    }

    export class Channel extends Base {
        constructor(client: Client, user: User, data: any);
        id: string;
        name: string;
        game: Game;
        title: string;
        language: string;
        stream: Stream;
        fetch(force: boolean): Promise<Channel>;
    }

    export class Stream extends Base {
        constructor(client: Client, channel: Channel, data: any);
        viewers: number;
        channel: Channel;
        title: string;
        thumbnailURL: string;
        tags: string[];
        id: string;
        game: Game;
        user: User;
        userID: string;
        startedAt: Date;

        fetch(force: boolean): Promise<Stream>;
    }

    export class User extends Base {
        constructor(client: Client, data: any);
        streamerType: string;
        description: string;
        displayName: string;
        id: string;
        loginName: string;
        profileURL: string;
        type: string;
        views: number;
        createdAt: Date;

        fetch(force: boolean): Promise<User>;
    }

    export class Game extends Base {
        constructor(client: Client, data: any);
        id: string;
        name: string;
        boxArtURL: string;

        fetch(force: boolean): Promise<Game>;
    }

    export interface ClientOptions {
        channels: string[];
        client_id: string[],
        client_secret: string[],
        port: number,
    }
}