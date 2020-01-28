import axios from 'axios';
import SObjects from './SObjects';

describe('SObjects.buildUrl', () => {
    it('returns simplest url with Requests API version', () => {
        const r: SObjects = new SObjects({ method: 'POST', sobject: 'Task', body: {}, apiVersion: 'v46.0' });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v46.0/sobjects/Task');
    });

    it('returns simplest url with Executor API version', () => {
        const r: SObjects = new SObjects({ method: 'POST', sobject: 'Task', body: {} });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobjects/Task');
    });

    it('returns url with params', () => {
        const r: SObjects = new SObjects({ method: 'POST', sobject: 'Task', params: ['@{NewAccount.id}']});
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobjects/Task/@{NewAccount.id}');
    });

    it('returns url with params and query string', () => {
        const r: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            params: ['@{NewAccount.id}'],
            qs: { fields: 'companyName' },
        });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobjects/Task/@{NewAccount.id}?fields=companyName');
    });
});

describe('SObjects.validate', () => {
    it('returns true is request is valid', () => {
       const r: SObjects = new SObjects({
           method: 'GET',
           sobject: 'Lead',
           params: ['A_LEAD_ID'],
       });

        expect(r.validate()).toBeTruthy();
    });

    it('throws if request has invalid parts', async() => {
        const r: SObjects = new SObjects({
            method: 'GET',
            sobject: 'Lead',
            body: { will: 'fail' },
        });

        let error;
        try {
            r.validate();
        } catch (err) {
            error = err;
        }

        expect(error.message).toBe('\'body\' is not supported with GET or HEAD methods.');
    });
});

describe('SObjects.execute', () => {
    it('should return data on success', async() => {
        const r: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { foo: 'bar' },
            apiVersion: 'v46.0',
        });

        const fakeAxios = axios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        (fakeAxios.request as jest.Mock) = jest.fn(async() => {
            return {
                data: {
                    id: '00Q1w0000029yNwEAI',
                    success: true,
                    errors: [],
                },
                status: 201,
                statusText: 'OK',
                headers: {},
                config: {},
            };
        });

        const data = await r.execute('v50.0', fakeAxios);

        expect(data.id).toHaveLength(18);
        expect(data.success).toBeTruthy();
        expect(data.errors).toHaveLength(0);
    });

    it('throws on error', async() => {
        const r: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { totally: 'wrong' },
            apiVersion: 'v46.0',
        });

        const fakeAxios = axios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        (fakeAxios.request as jest.Mock) = jest.fn(async() => {
            throw {
                message: 'Request failed with status code 400',
                isAxiosError: true,
                response: {
                    data: [{
                        "message": "You're creating a duplicate record. We recommend you use an existing record instead.",
                        "errorCode": "DUPLICATES_DETECTED",
                        "fields": [],
                    }],
                    config: {},
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                },
            };
        });

        let error;
        try {
            await r.execute('v50.0', fakeAxios);
        } catch (err) {
            error = err;
        }

        expect(error.isAxiosError).toBeTruthy();
        expect(error.response.data).toBeInstanceOf(Array);
        expect(error.response.data[0]).toHaveProperty('message');
        expect(error.response.data[0]).toHaveProperty('errorCode');
        expect(error.response.status).toBe(400);
        expect(error.response.statusText).toBe('Bad Request');
    });
});

describe('SObjects.getBody', () => {
    it('should return nothing when no body passed', () => {
        const r: SObjects = new SObjects({ method: 'POST', sobject: 'Task' });

        expect(r.getBody()).toBeUndefined();
    });

    it('should return object when body is set', () => {
        const r: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { foo: 'bar' },
        });

        expect(r.getBody()).toEqual({ foo: 'bar' });
    });
});

describe('SObjects.getMethod', () => {
    it('should return defined method', () => {
        const r: SObjects = new SObjects({ method: 'POST', sobject: 'Task' });

        expect(r.getMethod()).toBe('POST');
    });
});
