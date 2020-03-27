import * as qs from 'querystring';
import Composable from './Composable';
import axios, {AxiosResponse, Method} from 'axios';
import {RecordResponse} from './Responses';
import Auth from './Auth';
import Executable from './Executable';

export interface SObjectsConfig {
    method: Method;
    sobject: string;
    body?: object;
    params?: Array<string>;
    qs?: qs.ParsedUrlQueryInput;
    apiVersion?: string;
}

export default class SObjects implements Executable, Composable {
    static readonly pathPrefix: string = '/services/data/';
    static readonly pathSuffix: string = '/sobjects/';
    static readonly bodyExcludeMethods: Array<Method> = ['GET', 'HEAD'];
    static readonly paramsAllowedMethods: Array<Method> = ['HEAD', 'GET', 'PATCH', 'DELETE'];

    method: Method;
    sobject: string;
    body?: object;
    params?: Array<string>;
    qs?: qs.ParsedUrlQueryInput;
    apiVersion?: string;

    public constructor({
        method,
        sobject,
        body,
        params,
        qs,
        apiVersion,
    }: SObjectsConfig) {
        this.method = method;
        this.sobject = sobject;
        this.body = body;
        this.qs = qs;
        this.params = params;
        this.apiVersion = apiVersion;
    }

    public buildUrl(auth: Auth): string {
        let url: string = [
            SObjects.pathPrefix,
            this.apiVersion || auth.getApiVersion(),
            SObjects.pathSuffix,
            this.sobject,
        ].join('');

        if (this.params) {
            url += '/' + this.params.join('/');
        }

        if (this.qs) {
            url += '?' + qs.encode(this.qs);
        }

        return url;
    }

    public async execute<T extends RecordResponse>(auth: Auth): Promise<T> {
        this.validate();

        const res: AxiosResponse<T> = await axios.request({
            url: await auth.getInstanceUrl() + this.buildUrl(auth),
            method: this.method,
            data: this.body,
            headers: {
                'Authorization': 'Bearer ' + await auth.getToken(),
            },
        });

        return res.data;
    }

    public validate(): boolean | never {
        if (this.params && SObjects.paramsAllowedMethods.indexOf(this.method) === -1) {
            throw new Error(`Method ${this.method} is not supported with sobjects with params API.`);
        }

        if (this.body && SObjects.bodyExcludeMethods.indexOf(this.method) !== -1) {
            throw new Error('\'body\' is not supported with GET or HEAD methods.');
        }

        return true;
    }

    public getBody(): object | undefined {
        return this.body;
    }

    public getMethod(): Method {
        return this.method;
    }
}
