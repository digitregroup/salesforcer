# SalesForcer

![](https://github.com/digitregroup/salesforcer/workflows/CI/badge.svg)


SalesForcer is a wrapper around SalesForce API allowing to simply build single and composite requests.    
It uses [axios](https://github.com/axios/axios) to make HTTP requests.


## Usage

### Installing
Install using `npm`:
```sh
npm install --save @digitregroup/salesforcer
```

Install using `yarn`:
```sh
yarn add @digitregroup/salesforcer
```

### Request example

```js
const {Exectutor, Request} = require('@digitregroup/salesforcer');
const executor = new Exectutor({
   apiVersion: 'v48.0',
   baseUrl: 'https://my.fake.tld',
   authUrl: 'https://auth.my.fake.tld',
   clientId: 'fakeClientId',
   clientSecret: 'fakeClientSecret',
   grantType: 'password',
   password: 'fakeValidPassword',
   username: 'fakeUsername',
});
const request = new Request('POST', 'Task', {foo: 'bar'});
const response = await executor.execute(request);
```

### Composite example
```js
const {Exectutor, Request, Composite} = require('@digitregroup/salesforcer');
const executor = new Exectutor({
   apiVersion: 'v48.0',
   baseUrl: 'https://my.fake.tld',
   authUrl: 'https://auth.my.fake.tld',
   clientId: 'fakeClientId',
   clientSecret: 'fakeClientSecret',
   grantType: 'password',
   password: 'fakeValidPassword',
   username: 'fakeUsername',
});

const composite = new Composite(true);
composite
    .add({
        referenceId: 'NewLead',
        request: new Request('POST', 'Lead', {foo: 'bar'}),
    })
    .add({
        referenceId: 'AddTask',
        request: new Request('POST', 'Task', {bar: 'baz', WhoId: '@{NewLead.id}'}),
    });

const response = await executor.execute(composite);
```


## Api reference

### interface: `Executable`
#### `buildUrl(apiVersion: string): string;`
- returns: \<[string]>

#### `execute(apiVersion: string, axios: AxiosInstance): Promise<any>;`
- `apiVersion` \<[string]>
- `axios` \<[AxiosInstance]>
- returns: \<[Promise]\<any>>


### class: `Executor`
#### `constructor({ authUrl, grantType, clientId, clientSecret, username, password, baseUrl, apiVersion })`
- `authUrl` \<[string]>
- `grantType` \<[string]>
- `clientId` \<[string]>
- `clientSecret` \<[string]>
- `username` \<[string]>
- `password` \<[string]>
- `baseUrl` \<[string]>
- `apiVersion` \<[string]>

#### `auth(): Promise<void>`
- returns: \<[Promise]\<void>>

#### `execute(request: Executable): Promise<any>`
- `request` \<[Executable]>
- returns: \<[Promise]\<any>>


### class: `Request` implements `Executable`
#### `constructor(method, sobject, body, apiVersion?)`
- `method` \<[Method]>
- `sobject` \<[string]>
- `body` \<[object]>
- `apiVersion` \<[string] | null>


### class: `Composite` implements `Executable`
#### `constructor(allOrNone, apiVersion)`
- `allOrNone` \<[boolean]>
- `apiVersion` \<[string] | null>

#### `add({ request, referenceId }): Composite`
- `method` \<[Method]>
- `referenceId` \<[string]>
- returns: \<[Composite]>


## Contributing

### Building 
```sh
yarn build
```

### Linting
```sh
yarn lint
```

### Running tests 
```sh
yarn test
```
Mocks goes in `src/__mocks__/` then Jest handle the rest.

### Releasing version
```sh
npm version <version>
```
This will:
- update the `version` field in package.json
- commit the package.json
- tag with `<version>`



[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Objects "Object"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[AxiosInstance]: https://github.com/axios/axios/blob/v0.19.0/index.d.ts#L123 "AxiosInstance"
[Method]: https://github.com/axios/axios/blob/v0.19.0/index.d.ts#L24 "Method"
[Executable]: #interface-executable
[Request]: #class-request-implements-executable
[Composite]: #class-composite-implements-executable
