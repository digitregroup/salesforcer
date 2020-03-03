import axios, {AxiosResponse} from 'axios';

export interface AuthConfig {
    baseUrl: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    apiVersion: string;
}

export interface SalesforceAuthResponse {
    access_token: string;
    instance_url: string;
    id: string;
    token_type: string;
    issued_at: Date;
    signature: string;
}

export default class Auth {
    static readonly path: string = '/services/oauth2/token';

    private readonly baseUrl: string;
    private readonly grantType: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly username: string;
    private readonly password: string;
    private readonly apiVersion: string;

    private authPayload?: SalesforceAuthResponse;

    public constructor({
        grantType,
        clientId,
        clientSecret,
        username,
        password,
        baseUrl,
        apiVersion,
    }: AuthConfig) {
        this.baseUrl = baseUrl;
        this.grantType = grantType;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.username = username;
        this.password = password;
        this.apiVersion = apiVersion;
    }

    public getApiVersion(): string {
        return this.apiVersion;
    }

    public async getInstanceUrl(): Promise<string> {
        if (!this.authPayload) {
            this.authPayload = await this.authenticate();
        }

        return this.authPayload.instance_url;
    }

    public async getToken(): Promise<string> {
        if (!this.authPayload) {
            this.authPayload = await this.authenticate();
        }

        return this.authPayload.access_token;
    }

    public revoke(): void {
        this.authPayload = undefined;
    }

    private async authenticate(): Promise<SalesforceAuthResponse> {
        try {
            const response: AxiosResponse<SalesforceAuthResponse> = await axios.post(
                this.baseUrl + Auth.path,
                null,
                {
                    params: {
                        'grant_type': this.grantType,
                        'client_id': this.clientId,
                        'client_secret': this.clientSecret,
                        username: this.username,
                        password: this.password,
                    },
                },
            );

            return response.data;
        } catch (err) {
            throw new Error('An error occured authenticating on SalesForce');
        }
    }
}
