import Request from "./Request";
import Executable from "./Executable";
import {AxiosInstance, Method} from 'axios';

interface CompositeRequestPayload {
    method: Method;
    referenceId: string;
    url: string;
    body: object;
}

interface CompositePayload {
    allOrNone: boolean;
    compositeRequest: Array<CompositeRequestPayload>;
}

interface CompositeRequest {
    request: Request;
    referenceId: string;
}

class Composite implements Executable {

    static readonly urlPrefix = '/services/data/';
    static readonly urlSuffix = '/composite';

    allOrNone: boolean;
    requests: Array<CompositeRequest>;
    apiVersion: string | null;

    constructor(allOrNone: boolean, apiVersion: string | null = null) {
        this.allOrNone = allOrNone;
        this.requests = [];
        this.apiVersion = apiVersion;
    }

    add(compositeRequest: CompositeRequest): Composite {
        this.requests.push(compositeRequest);

        return this;
    }

    buildPayload(apiVersion: string): CompositePayload {
        const payload: CompositePayload = {
            allOrNone: this.allOrNone,
            compositeRequest: [],
        };

        for (const cRequest of this.requests) {
            payload.compositeRequest.push({
                method: cRequest.request.method,
                referenceId: cRequest.referenceId,
                url: cRequest.request.buildUrl(apiVersion),
                body: cRequest.request.body,
            })
        }

        return payload;
    }

    buildUrl(apiVersion: string): string {
        return [
            Composite.urlPrefix,
            this.apiVersion || apiVersion,
            Composite.urlSuffix,
        ].join('');
    }

    async execute(apiVersion: string, axios: AxiosInstance): Promise<object> {
        const res = await axios.request({
            url: this.buildUrl(apiVersion),
            method: 'POST',
            data: this.buildPayload(apiVersion),
        });

        return res.data;
    }
}

export default Composite;
