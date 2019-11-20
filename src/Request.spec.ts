import Request from './Request';
import mockedAxios from 'axios';

describe('Request.buildUrl', () => {
    it('returns url with Request API version', () => {
        const r: Request = new Request('POST', 'Task', {}, 'v46.0');
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v46.0/sobject/Task');
    });

    it('returns url with Executor API version', () => {
        const r: Request = new Request('POST', 'Task', {});
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual('/services/data/v50.5/sobject/Task');
    });
});


describe('Request.execute', () => {
    it('should return data on success', async() => {
        const r: Request = new Request(
            'POST',
            'Task',
            { foo: 'bar' },
            'v46.0',
        );

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
        const r: Request = new Request(
            'POST',
            'Task',
            { totally: 'wrong' },
            'v46.0',
        );

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
