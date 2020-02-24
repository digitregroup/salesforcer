import axios, {AxiosResponse} from 'axios';
import Query from './Query';
import Auth from './Auth';
import {QueryResponse, SalesforceRecord} from './Responses';


const auth: Auth = new Auth({
    apiVersion: 'v50.5',
    baseUrl: 'https://my.fake.tld',
    authUrl: 'https://auth.my.fake.tld',
    clientId: 'fakeClientId',
    clientSecret: 'fakeClientSecret',
    grantType: 'password',
    password: 'fakeInvalidPassword',
    username: 'fakeUsername',
});

(auth.getInstance as jest.Mock) = jest.fn(async() => 'https://my.fake.tld');
(auth.getToken as jest.Mock) = jest.fn(async() => 'fakeAccessToken');

interface TestRecord extends SalesforceRecord {
    Id: string;
}


describe('Query.buildUrl', () => {
    it('returns simplest url with Query API version', async() => {
        const query: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
            apiVersion: 'v46.0',
        });
        const url: string = await query.buildUrl(auth);

        expect(url).toEqual(
            'https://my.fake.tld/services/data/v46.0/query/?q=select+id+from+contact+where+name+=+\'Howard+Jones\'',
        );
    });

    it('returns simplest url with Auth default API version', async() => {
        const query: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
        });
        const url: string = await query.buildUrl(auth);

        expect(url).toEqual(
            'https://my.fake.tld/services/data/v50.5/query/?q=select+id+from+contact+where+name+=+\'Howard+Jones\'',
        );
    });
});

describe('Query.execute', () => {
    it('should return data on success', async() => {
        const query: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
            apiVersion: 'v46.0',
        });

        (axios.request as jest.Mock) = jest.fn(async(): Promise<AxiosResponse<QueryResponse<TestRecord>>> => {
            return {
                data: {
                    'totalSize': 1,
                    'done': true,
                    'records': [{
                        'attributes': {
                            'type': 'Contact',
                            'url': '/services/data/v46.0/sobjects/Contact/00Q1w0000029yNwEAI',
                        },
                        'Id': '00Q1w0000029yNwEAI',
                    }],
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };
        });

        const data = await query.execute<TestRecord>(auth);

        expect(data.records[0].Id).toHaveLength(18);
    });

    it('throws on error', async() => {
        const r: Query = new Query({
            query: 'select id from faultytable where name = \'Howard Jones\'',
            apiVersion: 'v46.0',
        });

        (axios.request as jest.Mock) = jest.fn(async() => {
            throw {
                message: 'Request failed with status code 400',
                isAxiosError: true,
                response: {
                    data: [{
                        'message': 'The error message here',
                        'errorCode': 'INVALID_TYPE',
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
            await r.execute(auth);
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

describe('Query.validate', () => {
    it('returns true is request is valid - always', () => {
        const r: Query = new Query({ query: 'select id from contact where name = \'Howard Jones\'' });
        expect(r.validate()).toBeTruthy();
    });
});

describe('Query.getBody', () => {
    it('should return nothing', () => {
        const r: Query = new Query({ query: 'select id from contact where name = \'Howard Jones\'' });
        expect(r.getBody()).toBeUndefined();
    });
});

describe('Query.getMethod', () => {
    it('should return GET', () => {
        const r: Query = new Query({ query: 'select id from contact where name = \'Howard Jones\'' });
        expect(r.getMethod()).toBe('GET');
    });
});
