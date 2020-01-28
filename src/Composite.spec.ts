import axios from 'axios';
import Composite from './Composite';
import SObjects from './SObjects';

describe('Composite.add', () => {
    it('adds a new CompositeRequest', () => {
        const c: Composite = new Composite(true);
        const testRequest: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Lead',
            body: { heck: 'yeah' },
        });

        expect(c.requests).toHaveLength(0);

        c.add({ referenceId: "NewLead", request: testRequest });

        expect(c.requests).toHaveLength(1);
        expect(c.requests[0].request).toEqual(testRequest);
        expect(c.requests[0].referenceId).toEqual('NewLead');
    });

    it('can be chained', () => {
        const c: Composite = new Composite(true);
        const testRequest: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Lead',
            body: { heck: 'yeah' },
        });

        expect(c.requests).toHaveLength(0);

        c
            .add({ referenceId: "first", request: testRequest })
            .add({ referenceId: "second", request: testRequest });

        expect(c.requests).toHaveLength(2);
        expect(c.requests[0].referenceId).toEqual('first');
        expect(c.requests[1].referenceId).toEqual('second');
    });
});

describe('Composite.buildUrl', () => {
    it('returns url with Requests API version', () => {
        const c: Composite = new Composite(true, 'v60.5');
        const url: string = c.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v60.5/composite');
    });

    it('returns url with Executor API version', () => {
        const c: Composite = new Composite(true);
        const url: string = c.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/composite');
    });
});

describe('Composite.buildPayload', () => {
    it('creates a payload with loaded requests', async() => {
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
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'AddTask', request: testNext });

        const payload = c.buildPayload('v50.0');

        expect(payload.allOrNone).toBeTruthy();
        expect(payload.compositeRequest).toHaveLength(2);
        expect(payload.compositeRequest[0].referenceId).toBe('NewLead');
        expect(payload.compositeRequest[1].referenceId).toBe('AddTask');
    });

    it('creates a payload with valid body usage', async() => {
        const c: Composite = new Composite(true);
        const testFirst: SObjects = new SObjects({
            method: 'GET',
            sobject: 'Lead',
            params: ['THE_LEAD_ID'],
        });
        const testNext: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: {sup: 'bruh', WhoId: '@{NewLead.id}'},
        });

        c
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'AddTask', request: testNext });

        const payload = c.buildPayload('v50.0');

        expect(payload.compositeRequest[0]).not.toHaveProperty('body');
    });
});

describe('Composite.execute', () => {
    it('should return data on success', async() => {
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
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'AddTask', request: testNext });

        const fakeAxios = axios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        (fakeAxios.request as jest.Mock) = jest.fn(async({ data }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const compositeResponse: any[] = [];
            for (const r of data.compositeRequest) {
                compositeResponse.push({
                    body: {
                        id: '001R00000033I6AIAU',
                        success: true,
                        errors: [],
                    },
                    httpHeaders: { Location: r.url + '/001R00000033I6AIAU' },
                    httpStatusCode: 201,
                    referenceId: r.referenceId,
                });
            }

            return {
                data: { compositeResponse },
                status: 201,
                statusText: 'OK',
                headers: {},
                config: {},
            };
        });

        const data = await c.execute('v50.0', fakeAxios);

        expect(data.compositeResponse).toHaveLength(2);
        expect(data.compositeResponse[0].referenceId).toBe('NewLead');
        expect(data.compositeResponse[1].referenceId).toBe('AddTask');
    });

    it('throws on error', async() => {
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
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'badTask', request: testNext });

        const fakeAxios = axios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        (fakeAxios.request as jest.Mock) = jest.fn(async({ data }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const compositeResponse: any[] = [];
            data.compositeRequest.forEach(() => {
                compositeResponse.push({
                    "body" : [ {
                        "message" : "Email: invalid email address: Not a real email address",
                        "errorCode" : "INVALID_EMAIL_ADDRESS",
                        "fields" : [ "Email" ],
                    } ],
                    "httpHeaders" : { },
                    "httpStatusCode" : 400,
                    "referenceId" : "badContact",
                });
            });

            throw {
                message: 'Request failed with status code 400',
                isAxiosError: true,
                response: {
                    data: { compositeResponse },
                    config: {},
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                },
            };
        });

        let error;
        try {
            await c.execute('v50.0', fakeAxios);
        } catch (err) {
            error = err;
        }

        expect(error.isAxiosError).toBeTruthy();
        expect(error.response.data.compositeResponse).toHaveLength(2);
        expect(error.response.status).toBe(400);
        expect(error.response.statusText).toBe('Bad Request');
    });
});
