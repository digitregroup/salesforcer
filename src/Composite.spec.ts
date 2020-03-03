import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import Composite from './Composite';
import SObjects from './SObjects';
import Auth from './Auth';
import {
    CompositeResponse,
    CompositeSubrequestResponse,
    SalesforceError,
    RecordCreateResponse,
} from './Responses';


const auth: Auth = new Auth({
    apiVersion: 'v50.5',
    baseUrl: 'https://my.fake.tld',
    clientId: 'fakeClientId',
    clientSecret: 'fakeClientSecret',
    grantType: 'password',
    password: 'fakeInvalidPassword',
    username: 'fakeUsername',
});

(auth.getInstanceUrl as jest.Mock) = jest.fn(async() => 'https://my.fake.tld');
(auth.getToken as jest.Mock) = jest.fn(async() => 'fakeAccessToken');


describe('Composite.add', () => {
    it('adds a new CompositeRequest', () => {
        const composite: Composite = new Composite(true);
        const testReq: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Lead',
            body: { heck: 'yeah' },
        });

        expect(composite.getRequests().size).toBe(0);

        composite.add('NewLead', testReq);

        const requests = composite.getRequests();
        expect(requests.size).toBe(1);
        expect(requests.has('NewLead')).toBeTruthy();
        expect(requests.get('NewLead')).toEqual(testReq);
    });

    it('can be chained', () => {
        const composite: Composite = new Composite(true);
        const testReq: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Lead',
            body: { heck: 'yeah' },
        });

        expect(composite.getRequests().size).toBe(0);

        composite
            .add('first', testReq)
            .add('second', testReq);

        const requests = composite.getRequests();
        expect(requests.size).toBe(2);
        expect(requests.has('first')).toBeTruthy();
        expect(requests.get('first')).toEqual(testReq);
        expect(requests.has('second')).toBeTruthy();
        expect(requests.get('second')).toEqual(testReq);
    });
});

describe('Composite.execute', () => {
    const c: Composite = new Composite(true);
    const testFirst: SObjects = new SObjects({
        method: 'POST',
        sobject: 'Lead',
        body: { heck: 'yeah' },
    });
    const testNext: SObjects = new SObjects({
        method: 'POST',
        sobject: 'Task',
        body: {sup: 'bruh', WhoId: '@{NewLead.id}'},
    });
    c
        .add('NewLead', testFirst)
        .add('AddTask', testNext);

    it('should return data on success', async() => {
        (axios.request as jest.Mock) = jest.fn(
            async({ data }: AxiosRequestConfig): Promise<AxiosResponse<CompositeResponse>> => {
                const compositeResponse: Array<CompositeSubrequestResponse> = [];

                for (const r of data.compositeRequest) {
                    const body: RecordCreateResponse = {
                        id: '001R00000033I6AIAU',
                        success: true,
                        errors: [],
                    };

                    compositeResponse.push({
                        body,
                        referenceID: r.referenceId,
                        httpHeaders: new Map([['Location', r.url + '/001R00000033I6AIAU']]),
                        httpStatusCode: 201,
                    });
                }

                return {
                    data: { compositeResponse },
                    status: 201,
                    statusText: 'OK',
                    headers: {},
                    config: {},
                };
            },
        );

        const data = await c.execute(auth);

        expect(data.compositeResponse).toHaveLength(2);
        expect(data.compositeResponse[0].referenceID).toBe('NewLead');
        expect(data.compositeResponse[1].referenceID).toBe('AddTask');
    });

    it('throws on error', async() => {
        (axios.request as jest.Mock) = jest.fn(
            async({ data }: AxiosRequestConfig): Promise<AxiosResponse<CompositeResponse>> => {
                const compositeResponse: Array<CompositeSubrequestResponse> = [];
                data.compositeRequest.forEach(() => {
                    const body: SalesforceError = [ {
                        'message' : 'Email: invalid email address: Not a real email address',
                        'errorCode' : 'INVALID_EMAIL_ADDRESS',
                        'fields' : [ 'Email' ],
                    } ];

                    compositeResponse.push({
                        body,
                        referenceID: 'badContact',
                        httpHeaders: new Map(),
                        httpStatusCode: 400,
                    });
                });

                throw {
                    config: undefined,
                    name: 'AxiosError',
                    message: 'Request failed with status code 400',
                    isAxiosError: true,
                    toJSON: (): void => { /* NOOP */ },
                    response: {
                        data: {compositeResponse},
                        config: {},
                        headers: {},
                        status: 400,
                        statusText: 'Bad Request',
                    },
                };
            },
        );

        let error;
        try {
            await c.execute(auth);
        } catch (err) {
            error = err;
        }

        expect(error.isAxiosError).toBeTruthy();
        expect(error.response.data.compositeResponse).toHaveLength(2);
        expect(error.response.status).toBe(400);
        expect(error.response.statusText).toBe('Bad Request');
    });
});
