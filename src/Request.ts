import * as qs from 'querystring';
import Executable from "./Executable";
import Validable from "./Validable";
import {AxiosInstance, Method} from 'axios';

interface RequestConfig {
    method: Method;
    sobject: string;
    body?: object;
    params?: Array<string>;
    qs?: qs.ParsedUrlQueryInput;
    apiVersion?: string;
}

class Request implements Executable, Validable {
    static readonly urlPrefix: string = '/services/data/';
    static readonly urlSuffix: string = '/sobjects/';
    static readonly methodBodyExclude: Array<Method> = ['GET', 'HEAD'];

    method: Method;
    sobject: string;
    body?: object;
    params?: Array<string>;
    qs?: qs.ParsedUrlQueryInput;
    apiVersion?: string;

    constructor({
        method,
        sobject,
        body,
        params,
        qs,
        apiVersion,
    }: RequestConfig) {
        this.method = method;
        this.sobject = sobject;
        this.body = body;

        if (qs) {
            this.qs = qs;
        }
        if (params) {
            this.params = params;
        }
        if (apiVersion) {
            this.apiVersion = apiVersion;
        }
    }

    buildUrl(apiVersion: string): string {
        let url: string = [
            Request.urlPrefix,
            this.apiVersion || apiVersion,
            Request.urlSuffix,
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

    // Data from external APIs could be anything and could also change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async execute(apiVersion: string, axios: AxiosInstance): Promise<any> {
        this.validate();

        const res = await axios.request({
            url: this.buildUrl(apiVersion),
            method: this.method,
            data: this.body,
        });

        return res.data;
    }

    validate(): boolean | never {
        if (Request.methodBodyExclude.indexOf(this.method) !== -1 && this.body) {
            throw new Error('\'body\' is not supported with GET or HEAD methods.');
        }

        return true;
    }
}

export default Request;
