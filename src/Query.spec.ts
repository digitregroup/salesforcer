import axios from 'axios';
import Query from './Query';

describe('Query.buildUrl', () => {
    it('returns simplest url with Requests API version', () => {
        const r: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
            apiVersion: 'v46.0',
        });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual(
            '/services/data/v46.0/query/?q=select+id+from+contact+where+name+=+\'Howard+Jones\'',
        );
    });

    it('returns simplest url with Executor API version', () => {
        const r: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
        });
        const url: string = r.buildUrl('v50.5');

        expect(url).toEqual(
            '/services/data/v50.5/query/?q=select+id+from+contact+where+name+=+\'Howard+Jones\'',
        );
    });
});

describe('Query.validate', () => {
    it('returns true is request is valid - always', () => {
        const r: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
        });

        expect(r.validate()).toBeTruthy();
    });
});

describe('Query.execute', () => {
    it('should return data on success', async() => {
        const r: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
            apiVersion: 'v46.0',
        });

        const fakeAxios = axios.create({
            baseURL: 'FakeBaseUrl',
            headers: { Authorization: 'Bearer RmFrZSBzaWduYXR1cmU=' },
        });

        (fakeAxios.request as jest.Mock) = jest.fn(async() => {
            return {
                data: {
                    "totalSize": 1,
                    "done": true,
                    "records": [{
                        "attributes": {
                            "type": "Contact",
                            "url": "/services/data/v46.0/sobjects/Contact/00Q1w0000029yNwEAI",
                        },
                        "Id": "00Q1w0000029yNwEAI",
                    }],
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };
        });

        const data = await r.execute('v50.0', fakeAxios);

        expect(data.records[0].Id).toHaveLength(18);
    });

    it('throws on error', async() => {
        const r: Query = new Query({
            query: 'select id from faultytable where name = \'Howard Jones\'',
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
                        "message": "The error message here",
                        "errorCode": "INVALID_TYPE",
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


describe('Query.getBody', () => {
    it('should return nothing', () => {
        const r: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
        });

        expect(r.getBody()).toBeUndefined();
    });
});

describe('Query.getMethod', () => {
    it('should return GET', () => {
        const r: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
        });

        expect(r.getMethod()).toBe('GET');
    });
});
