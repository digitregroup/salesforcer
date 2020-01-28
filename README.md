# SalesForcer

<p>
  <a href="https://github.com/digitregroup/salesforcer/actions?query=workflow%3ACI+event%3Apush+branch%3Amaster">
    <img src="https://github.com/digitregroup/salesforcer/workflows/CI/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/@digitregroup/salesforcer">
    <img src="https://img.shields.io/npm/v/@digitregroup/salesforcer">
  </a>
</p>


SalesForcer is a wrapper around SalesForce API allowing to simply build single and composite requests.    
It uses [axios](https://github.com/axios/axios) to make HTTP requests.

**LIMITATIONS AND DISCLAIMER**  
This library is in [pre 1.0.0 state](https://semver.org/#spec-item-4). Api and structure can change and break frequently.  
Currently only `sobjects` and `query` requests are supported.


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
const {Executor, SObjects} = require('@digitregroup/salesforcer');
const executor = new Executor({ /* Ommited */ });

const soRequest = new SObjects({
    method: 'POST',
    sobject: 'Task',
    body: { foo: 'bar' },
});

const response = await executor.execute(soRequest);
```

### Composite example

```js
const {Executor, SObjects, Composite} = require('@digitregroup/salesforcer');
const executor = new Executor({ /* Ommited */ });

const composite = new Composite(true);
composite
    .add({
        referenceId: 'NewLead',
        request: new SObjects({
            method: 'POST',
            sobject: 'Lead',
            body: { foo: 'bar' },
        }),
    })
    .add({
        referenceId: 'AddTask',
        request: new SObjects({
            method: 'POST',
            sobject: 'Task',
            body: { bar: 'baz', WhoId: '@{NewLead.id}' },
        }),
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


### interface: `Validable`
#### `validate(): boolean | never;`
- returns: \<[boolean]>


### abstract class: `Request` implements `Executable`, `Validable`
#### `getBody(): object | undefined;`
#### `getMethod(): Method;`


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


### class: `Query` extends `Request`
#### `constructor({ method, sobject, body?, params?, qs?, apiVersion? });`
- `query` \<[string]>
- `apiVersion` \<[string]>


### class: `SObjects` extends `Request`
#### `constructor({ method, sobject, body?, params?, qs?, apiVersion? });`
- `method` \<[Method]>
- `sobject` \<[string]>
- `body` \<[object]>
- `params` \<[Array]<[string]>>
- `qs` \<[ParsedUrlQueryInput]>
- `apiVersion` \<[string]>


### class: `Composite` implements `Executable`
#### `constructor(allOrNone, apiVersion?)`
- `allOrNone` \<[boolean]>
- `apiVersion` \<[string]>

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

### Releasing version
```sh
npm version <version>
```
This will:
- update the `version` field in package.json
- commit the package.json
- tag with `v<version>`



[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Objects "Object"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Indexed_collections_Arrays_and_typed_Arrays "Array"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[AxiosInstance]: https://github.com/axios/axios/blob/v0.19.0/index.d.ts#L123 "AxiosInstance"
[ParsedUrlQueryInput]: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/querystring.d.ts#L13 "ParsedUrlQueryInput"
[Method]: https://github.com/axios/axios/blob/v0.19.0/index.d.ts#L24 "Method"
[Executable]: #interface-executable
[Request]: #class-request-implements-executable
[Composite]: #class-composite-implements-executable



