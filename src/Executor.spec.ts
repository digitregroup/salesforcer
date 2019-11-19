import Executor from './Executor';

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

        await e.auth();

        expect(e.token).toEqual('fakeAccessToken');
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

        await expect(e.auth()).rejects.toBeTruthy();
    });
});
