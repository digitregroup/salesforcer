import Request from './Request';
import Executable from './Executable';
import Validable from './Validable';
import {AxiosInstance, Method} from 'axios';

interface QueryConfig {
    query: string;
    apiVersion?: string;
}

class Query extends Request implements Executable, Validable {
    static readonly urlSuffix: string = '/query/';
    static readonly method: Method = 'GET';

    query: string;
    apiVersion?: string;

    constructor({
        query,
        apiVersion,
    }: QueryConfig) {
        super();

        this.query = query;

        if (apiVersion) {
            this.apiVersion = apiVersion;
        }
    }

    buildUrl(apiVersion: string): string {
        return [
            Query.urlPrefix,
            this.apiVersion || apiVersion,
            Query.urlSuffix,
            '?q=' + this.query.replace(/\s/g, '+'),
        ].join('');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async execute(apiVersion: string, axios: AxiosInstance): Promise<any> {
        this.validate();

        const res = await axios.request({
            url: this.buildUrl(apiVersion),
            method: Query.method,
        });

        return res.data;
    }

    validate(): boolean | never {
        // Nothing edge case to throw upon
        return true;
    }

    getBody(): object | undefined {
        return undefined;
    }

    getMethod(): Method {
        return Query.method;
    }
}

export default Query;
