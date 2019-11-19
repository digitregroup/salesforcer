import axios, {AxiosInstance, AxiosResponse} from 'axios';
import Executable from "./Executable";

interface ExecutorConfig {
    authUrl: string
    grantType: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;

    baseUrl: string;
    apiVersion: string;
}

class Executor {
    authUrl: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;

    baseUrl: string;
    apiVersion: string;

    axios: AxiosInstance | undefined;
    token: string | undefined;

    constructor({
        authUrl,
        grantType,
        clientId,
        clientSecret,
        username,
        password,
        baseUrl,
        apiVersion,
    }: ExecutorConfig) {
        this.authUrl = authUrl;
        this.grantType = grantType;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.username = username;
        this.password = password;

        this.baseUrl = baseUrl;
        this.apiVersion = apiVersion;
    }

    async auth(): Promise<void> {
        if (this.axios !== undefined && this.token !== undefined) {
            return;
        }

        try {
            const response: AxiosResponse = await axios.post(
                this.authUrl,
                null,
                {
                    params: {
                        grant_type: this.grantType,
                        client_id: this.clientId,
                        client_secret: this.clientSecret,
                        username: this.username,
                        password: this.password,
                    },
                }
            );

            this.token = response.data.access_token;
            this.axios = axios.create({
                baseURL: this.baseUrl,
                headers: { Authorization: 'Bearer ' + this.token },
            });
        } catch (err) {
            throw new Error('An error occured authenticating on SalesForce');
        }
    }

    async execute(request: Executable): Promise<any> {
        if (this.axios) {
            return await request.execute(this.apiVersion, this.axios);
        }
    }
}

export default Executor;
