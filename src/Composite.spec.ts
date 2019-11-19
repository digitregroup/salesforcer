import Composite from './Composite';
import Request from "./Request";
import mockedAxios from 'axios';

describe('Composite.add', () => {
    it('adds a new CompositeRequest', () => {
        const c: Composite = new Composite(true);
        const testRequest: Request = new Request('POST', 'Lead', {heck: 'yeah'});

        expect(c.requests.length).toBe(0);

        c.add({ referenceId: "NewLead", request: testRequest });

        expect(c.requests.length).toBe(1);
        expect(c.requests[0].request).toEqual(testRequest);
        expect(c.requests[0].referenceId).toEqual('NewLead');
    });

    it('can be chained', () => {
        const c: Composite = new Composite(true);
        const testRequest: Request = new Request('POST', 'Lead', {heck: 'yeah'});

        expect(c.requests.length).toBe(0);

        c
            .add({ referenceId: "first", request: testRequest })
            .add({ referenceId: "second", request: testRequest });

        expect(c.requests.length).toBe(2);
        expect(c.requests[0].referenceId).toEqual('first');
        expect(c.requests[1].referenceId).toEqual('second');
    });
});

describe('Composite.buildUrl', () => {
    it('returns url with Request API version', () => {
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
        const testFirst: Request = new Request('POST', 'Lead', {heck: 'yeah'});
        const testNext: Request = new Request('POST', 'Task', {sup: 'bruh', WhoId: '@{NewLead.id}'});

        c
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'AddTask', request: testNext });

        const payload = c.buildPayload('v50.0');

        expect(payload.allOrNone).toBeTruthy();
        expect(payload.compositeRequest.length).toBe(2);
        expect(payload.compositeRequest[0].referenceId).toBe('NewLead');
        expect(payload.compositeRequest[1].referenceId).toBe('AddTask');
    });
});

describe('Composite.execute', () => {
    it('should return data on success', async() => {
        const c: Composite = new Composite(true);
        const testFirst: Request = new Request('POST', 'Lead', {heck: 'yeah'});
        const testNext: Request = new Request('POST', 'Task', {sup: 'bruh', WhoId: '@{NewLead.id}'});

        c
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'AddTask', request: testNext });

        const fakeAxios = mockedAxios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        const data = await c.execute('v50.0', fakeAxios);

        expect(data.compositeResponse.length).toBe(2);
        expect(data.compositeResponse[0].referenceId).toBe('NewLead');
        expect(data.compositeResponse[1].referenceId).toBe('AddTask');
    });

    it('throws on error', async() => {
        const c: Composite = new Composite(true);
        const testFirst: Request = new Request('POST', 'Lead', {heck: 'yeah'});
        const testNext: Request = new Request('POST', 'Task', {sup: 'bruh', WhoId: '@{NewLead.id}'});

        c
            .add({ referenceId: "NewLead", request: testFirst })
            .add({ referenceId: 'badTask', request: testNext });

        const fakeAxios = mockedAxios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        let error;
        try {
            await c.execute('v50.0', fakeAxios);
        } catch (err) {
            error = err;
        }

        expect(error.isAxiosError).toBeTruthy();
        expect(error.response.data.compositeResponse.length).toBe(2);
        expect(error.response.status).toBe(400);
        expect(error.response.statusText).toBe('Bad Request');
    });
});
