import axios, {AxiosResponse} from 'axios';
import SObjects from './SObjects';
import Auth from './Auth';
import {RecordCreateResponse} from './Responses';


const auth: Auth = new Auth({
    apiVersion: 'v50.5',
    baseUrl: 'https://my.fake.tld',
    clientId: 'fakeClientId',
    clientSecret: 'fakeClientSecret',
    password: 'fakeInvalidPassword',
    username: 'fakeUsername',
});

(auth.getInstanceUrl as jest.Mock) = jest.fn(async() => 'https://my.fake.tld');
(auth.getToken as jest.Mock) = jest.fn(async() => 'fakeAccessToken');


describe('SObjects.buildUrl', () => {
    it('returns simplest url with SObjects API version', async() => {
        const sobject: SObjects = new SObjects({ method: 'POST', sobject: 'Task', body: {}, apiVersion: 'v46.0' });
        const url: string = await sobject.buildUrl(auth);

        expect(url).toEqual('https://my.fake.tld/services/data/v46.0/sobjects/Task');
    });

    it('returns simplest url with Executor API version', async() => {
        const sobject: SObjects = new SObjects({ method: 'POST', sobject: 'Task', body: {} });
        const url: string = await sobject.buildUrl(auth);

        expect(url).toEqual('https://my.fake.tld/services/data/v50.5/sobjects/Task');
    });

    it('returns url with params', async() => {
        const sobject: SObjects = new SObjects({ method: 'POST', sobject: 'Task', params: ['@{NewAccount.id}']});
        const url: string = await sobject.buildUrl(auth);

        expect(url).toEqual('https://my.fake.tld/services/data/v50.5/sobjects/Task/@{NewAccount.id}');
    });

    it('returns url with params and query string', async() => {
        const sobject: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            params: ['@{NewAccount.id}'],
            qs: { fields: 'companyName' },
        });
        const url: string = await sobject.buildUrl(auth);

        expect(url).toEqual(
            'https://my.fake.tld/services/data/v50.5/sobjects/Task/@{NewAccount.id}?fields=companyName',
        );
    });
});

describe('SObjects.execute', () => {
    it('should return data on success', async() => {
        const sobject: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { foo: 'bar' },
            apiVersion: 'v46.0',
        });

        (axios.request as jest.Mock) = jest.fn(async(): Promise<AxiosResponse<RecordCreateResponse>> => {
            const data: RecordCreateResponse = {
                id: '00Q1w0000029yNwEAI',
                success: true,
                errors: [],
            };
            return {
                data,
                status: 201,
                statusText: 'OK',
                headers: {},
                config: {},
            };
        });

        const data: RecordCreateResponse = await sobject.execute(auth);

        expect(data.id).toHaveLength(18);
        expect(data.success).toBeTruthy();
        expect(data.errors).toHaveLength(0);
    });

    it('throws on error', async() => {
        const sobject: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { totally: 'wrong' },
            apiVersion: 'v46.0',
        });

        (axios.request as jest.Mock) = jest.fn(async() => {
            throw {
                message: 'Request failed with status code 400',
                isAxiosError: true,
                response: {
                    data: [{
                        'message': 'You\'re creating a duplicate record. We recommend you use an existing record instead.',
                        'errorCode': 'DUPLICATES_DETECTED',
                        'fields': [],
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
            await sobject.execute(auth);
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
        const sobject: SObjects = new SObjects({ method: 'POST', sobject: 'Task' });
        expect(sobject.getBody()).toBeUndefined();
    });

    it('should return object when body is set', () => {
        const sobject: SObjects = new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { foo: 'bar' },
        });
        expect(sobject.getBody()).toEqual({ foo: 'bar' });
    });
});

describe('SObjects.validate', () => {
    it('returns true is request is valid', () => {
        const sobject: SObjects = new SObjects({
            method: 'GET',
            sobject: 'Lead',
            params: ['A_LEAD_ID'],
        });

        expect(sobject.validate()).toBeTruthy();
    });

    it('throws if request has invalid parts', async() => {
        const sobject: SObjects = new SObjects({
            method: 'GET',
            sobject: 'Lead',
            body: { will: 'fail' },
        });

        let error;
        try {
            sobject.validate();
        } catch (err) {
            error = err;
        }

        expect(error.message).toBe('\'body\' is not supported with GET or HEAD methods.');
    });

    it('throws if request has invalid methods', async() => {
        const sobject: SObjects = new SObjects({
            method: 'PUT',
            sobject: 'Lead',
            params: ['MYOBJECTID'],
            body: { will: 'fail' },
        });

        let error;
        try {
            sobject.validate();
        } catch (err) {
            error = err;
        }

        expect(error.message).toBe('Method PUT is not supported with sobjects with params API.');
    });
});

describe('SObjects.getMethod', () => {
    it('should return defined method', () => {
        const sobject: SObjects = new SObjects({ method: 'POST', sobject: 'Task' });
        expect(sobject.getMethod()).toBe('POST');
    });
});
