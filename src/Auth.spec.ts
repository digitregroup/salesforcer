/* eslint-disable no-alert, @typescript-eslint/no-explicit-any */

import axios from 'axios';
import Auth from './Auth';

describe('Auth.getToken', () => {
    it('Fetch token and returns it of not already set', async () => {
        const auth: Auth = new Auth({
            apiVersion: 'v0.0',
            baseUrl: 'https://my.fake.tld',
            clientId: 'fakeClientId',
            clientSecret: 'fakeClientSecret',
            password: 'fakeValidPassword',
            username: 'fakeUsername',
        });

        const spy = jest.spyOn(auth as any, 'authenticate');

        (axios.post as jest.Mock) = jest.fn(async() => {
            return {
                data: {
                    'access_token': 'fakeAccessToken',
                    'instance_url': 'https://my.fake.tld',
                    'id': 'https://my.fake.tld/id/00D1X0000008bP2UAI/0051t000003LPVHAA4',
                    'token_type': 'Bearer',
                    'issued_at': '1573829868942',
                    'signature': 'RmFrZSBzaWduYXR1cmU=',
                },
                status: 200,
                statusText: 'OK',
            }
        });

        const token = await auth.getToken();

        expect(token).toEqual('fakeAccessToken');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('Fetch token only once on multiple calls', async () => {
        const auth: Auth = new Auth({
            apiVersion: 'v0.0',
            baseUrl: 'https://my.fake.tld',
            clientId: 'fakeClientId',
            clientSecret: 'fakeClientSecret',
            password: 'fakeValidPassword',
            username: 'fakeUsername',
        });

        const spyAuthenticate = jest.spyOn(auth as any, 'authenticate');
        const spyGetToken = jest.spyOn(auth as any, 'getToken');

        (axios.post as jest.Mock) = jest.fn(async() => {
            return {
                data: {
                    'access_token': 'fakeAccessToken',
                    'instance_url': 'https://my.fake.tld',
                    'id': 'https://my.fake.tld/id/00D1X0000008bP2UAI/0051t000003LPVHAA4',
                    'token_type': 'Bearer',
                    'issued_at': '1573829868942',
                    'signature': 'RmFrZSBzaWduYXR1cmU=',
                },
                status: 200,
                statusText: 'OK',
            }
        });

        // Call a first time
        const token = await auth.getToken();
        const tokenAgain = await auth.getToken();

        expect(token).toEqual(tokenAgain);
        expect(token).toEqual('fakeAccessToken');
        expect(spyGetToken).toHaveBeenCalledTimes(2);
        expect(spyAuthenticate).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('throws on fail', async () => {
        const auth: Auth = new Auth({
            apiVersion: 'v0.0',
            baseUrl: 'https://my.fake.tld',
            clientId: 'fakeClientId',
            clientSecret: 'fakeClientSecret',
            password: 'fakeInvalidPassword',
            username: 'fakeUsername',
        });

        (axios.post as jest.Mock) = jest.fn(async() => {
            throw {
                message: 'Request failed with status code 400',
                isAxiosError: true,
                response: {
                    data: {
                        'error': 'invalid_grant',
                        'error_description': 'authentication failure',
                    },
                    config: {},
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                },
            };
        });

        await expect(auth.getToken()).rejects.toBeTruthy();
        expect(axios.post).toHaveBeenCalledTimes(1);
    });
});
