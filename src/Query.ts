import axios, {AxiosResponse, Method} from 'axios';
import {QueryResponse, SalesforceRecord} from './Responses';
import Auth from './Auth';
import Composable from './Composable';
import Executable from './Executable';

export interface QueryConfig {
    query: string;
    apiVersion?: string;
}

export default class Query implements Executable, Composable {
    static readonly pathPrefix: string = '/services/data/';
    static readonly pathSuffix: string = '/query/';
    static readonly method: Method = 'GET';

    query: string;
    apiVersion?: string;

    constructor({
        query,
        apiVersion,
    }: QueryConfig) {
        this.query = query;
        this.apiVersion = apiVersion;
    }

    public buildUrl(auth: Auth): string {
        return encodeURI(
            [
                Query.pathPrefix,
                this.apiVersion || auth.getApiVersion(),
                Query.pathSuffix,
                '?q=' + this.query,
            ].join(''),
        ).replace(/%20/g, '+');
    }

    public async execute<T extends SalesforceRecord>(auth: Auth): Promise<QueryResponse<T>> {
        this.validate();

        const res: AxiosResponse<QueryResponse<T>> = await axios.request({
            url: await auth.getInstanceUrl() + this.buildUrl(auth),
            method: Query.method,
            headers: {
                'Authorization': 'Bearer ' + await auth.getToken(),
            },
        });

        return res.data;
    }

    public validate(): boolean | never {
        return true;
    }

    public getBody(): object | undefined {
        return undefined;
    }

    public getMethod(): Method {
        return Query.method;
    }
}
