import Request from './Request';
import mockedAxios from 'axios';

describe('Request.buildUrl', () => {
    it('returns simplest url with Request API version', () => {
        const r: Request = new Request({ method: 'POST', sobject: 'Task', body: {}, apiVersion: 'v46.0' });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v46.0/sobjects/Task');
    });

    it('returns simplest url with Executor API version', () => {
        const r: Request = new Request({ method: 'POST', sobject: 'Task', body: {} });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobjects/Task');
    });

    it('returns url with params', () => {
        const r: Request = new Request({ method: 'POST', sobject: 'Task', params: ['@{NewAccount.id}']});
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobjects/Task/@{NewAccount.id}');
    });

    it('returns url with params and query string', () => {
        const r: Request = new Request({
            method: 'POST',
            sobject: 'Task',
            params: ['@{NewAccount.id}'],
            qs: { fields: 'companyName' },
        });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobjects/Task/@{NewAccount.id}?fields=companyName');
    });
});

describe('Request.validate', () => {
    it('returns true is request is valid', () => {
       const r: Request = new Request({
           method: 'GET',
           sobject: 'Lead',
           params: ['A_LEAD_ID'],
       });

        expect(r.validate()).toBeTruthy();
    });

    it('throws if request has invalid parts', async() => {
        const r: Request = new Request({
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

describe('Request.execute', () => {
    it('should return data on success', async() => {
        const r: Request = new Request({
            method: 'POST',
            sobject: 'Task',
            body: { foo: 'bar' },
            apiVersion: 'v46.0',
        });

        const fakeAxios = mockedAxios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        const data = await r.execute('v50.0', fakeAxios);

        expect(data.id).toHaveLength(18);
        expect(data.success).toBeTruthy();
        expect(data.errors).toHaveLength(0);
    });

    it('throws on error', async() => {
        const r: Request = new Request({
            method: 'POST',
            sobject: 'Task',
            body: { totally: 'wrong' },
            apiVersion: 'v46.0',
        });

        const fakeAxios = mockedAxios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
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
