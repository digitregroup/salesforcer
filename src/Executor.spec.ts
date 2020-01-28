import axios from 'axios';
import Executor from './Executor';
import Query from "./Query";

describe('Executor.auth', () => {
    it('sets axios and token on success', async () => {
        const e: Executor = new Executor({
            apiVersion: "v0.0",
            baseUrl: "https://my.fake.tld",
            authUrl: "https://auth.my.fake.tld",
            clientId: "fakeClientId",
            clientSecret: "fakeClientSecret",
            grantType: "password",
            password: "fakeValidPassword",
            username: "fakeUsername",
        });

        (axios.post as jest.Mock) = jest.fn(async() => {
            return {
                data: {
                    "access_token": "fakeAccessToken",
                    "instance_url": "https://my.fake.tld",
                    "id": "https://my.fake.tld/id/00D1X0000008bP2UAI/0051t000003LPVHAA4",
                    "token_type": "Bearer",
                    "issued_at": "1573829868942",
                    "signature": "RmFrZSBzaWduYXR1cmU=",
                },
                status: 200,
                statusText: 'OK',
            }
        });

        await e.auth();

        expect(e.token).toEqual('fakeAccessToken');
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('throws on fail', async () => {
        const e: Executor = new Executor({
            apiVersion: "v0.0",
            baseUrl: "https://my.fake.tld",
            authUrl: "https://auth.my.fake.tld",
            clientId: "fakeClientId",
            clientSecret: "fakeClientSecret",
            grantType: "password",
            password: "fakeInvalidPassword",
            username: "fakeUsername",
        });

        (axios.post as jest.Mock) = jest.fn(async() => {
            throw {
                message: 'Request failed with status code 400',
                isAxiosError: true,
                response: {
                    data: {
                        error: 'invalid_grant',
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        error_description: 'authentication failure',
                    },
                    config: {},
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                },
            };
        });

        await expect(e.auth()).rejects.toBeTruthy();
        expect(axios.post).toHaveBeenCalledTimes(1);
    });
});

describe('Executor.execute', () => {
    it('auto auth on execution if not aleady authed', async () => {
        const e: Executor = new Executor({
            apiVersion: "v0.0",
            baseUrl: "https://my.fake.tld",
            authUrl: "https://auth.my.fake.tld",
            clientId: "fakeClientId",
            clientSecret: "fakeClientSecret",
            grantType: "password",
            password: "fakeValidPassword",
            username: "fakeUsername",
        });

        // Add spy on auth to track calls
        const spy = jest.spyOn(e, 'auth');

        (axios.post as jest.Mock) = jest.fn(async() => {
            return {
                data: {
                    "access_token": "fakeAccessToken",
                    "instance_url": "https://my.fake.tld",
                    "id": "https://my.fake.tld/id/00D1X0000008bP2UAI/0051t000003LPVHAA4",
                    "token_type": "Bearer",
                    "issued_at": "1573829868942",
                    "signature": "RmFrZSBzaWduYXR1cmU=",
                },
                status: 200,
                statusText: 'OK',
            }
        });

        // Make a dummy request
        const q: Query = new Query({
            query: 'select id from contact where name = \'Howard Jones\'',
        });
        (q.execute as jest.Mock) = jest.fn(async() => { return { data: true } });

        await e.execute(q);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
