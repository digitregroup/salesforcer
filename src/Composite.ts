import Composable from './Composable';
import Executable from './Executable';
import axios, {AxiosResponse, Method} from 'axios';
import {CompositeResponse} from './Responses';
import Auth from './Auth';


export interface CompositeRequestPayload {
    method: Method;
    referenceId: string;
    url: string;
    body?: object;
}

export interface CompositePayload {
    allOrNone: boolean;
    compositeRequest: Array<CompositeRequestPayload>;
}

export default class Composite implements Executable {
    static readonly pathPrefix: string = '/services/data/';
    static readonly pathSuffix: string = '/composite';
    static readonly method: Method = 'POST';

    private readonly allOrNone: boolean;
    private readonly requests: Map<string, Composable>;
    private apiVersion?: string;

    public constructor(allOrNone: boolean, apiVersion?: string) {
        this.allOrNone = allOrNone;
        this.requests = new Map<string, Composable>();
        this.apiVersion = apiVersion;
    }

    public add(referenceId: string, request: Composable): Composite {
        this.requests.set(referenceId, request);

        return this;
    }

    private async buildPayload(auth: Auth): Promise<CompositePayload> {
        const payload: CompositePayload = {
            allOrNone: this.allOrNone,
            compositeRequest: [],
        };

        for (const [ref, req] of this.requests) {
            req.validate();

            const p: CompositeRequestPayload = {
                method: req.getMethod(),
                referenceId: ref,
                url: await req.buildUrl(auth),
            };

            if (req.getBody()) {
                p.body = req.getBody();
            }

            payload.compositeRequest.push(p);
        }

        return payload;
    }

    private async buildUrl(auth: Auth): Promise<string> {
        return [
            await auth.getInstance(),
            Composite.pathPrefix,
            this.apiVersion || auth.getApiVersion(),
            Composite.pathSuffix,
        ].join('');
    }

    public async execute(auth: Auth): Promise<CompositeResponse> {
        const res: AxiosResponse<CompositeResponse> = await axios.request({
            url: await this.buildUrl(auth),
            method: Composite.method,
            data: await this.buildPayload(auth),
        });

        return res.data;
    }

    public getRequests(): Map<string, Composable> {
        return this.requests;
    }
}
