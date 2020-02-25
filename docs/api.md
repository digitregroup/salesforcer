# Salesforcer API Documentation


- Salesforce documentation:
    * [Authentication](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart_oauth.htm)
    * [Query](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_query.htm)
    * [SObjects](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/using_resources_working_with_records.htm)
    * [Composite](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite.htm)


Table of contents:
- [class: Auth](#class-auth)
    * [auth.constructor(authConfig)](#constructorauthconfig)
    * [auth.getApiVersion()](#authgetapiversion)
    * [auth.getInstance()](#authgetinstance)
    * [auth.getToken()](#authgettoken)
    * [auth.revoke()](#authrevoke)
- [class: Query](#class-query)
    * [query.constructor(queryConfig)](#constructorqueryconfig)
- [class: SObjects](#class-sobjects)
    * [sobjects.constructor(sobjectConfig)](#constructorsobjectconfig)
- [class: Composite](#class-composite)
    * [composite.constructor(allOrNone, apiVersion)](#constructorallornone-apiversion)
    * [composite.add(referenceId, request)](#compositeaddreferenceid-request)
    * [composite.getRequests()](#compositegetrequests)
- [interface: Executable](#interface-executable)
    * [executable.execute(auth)](#executableexecuteauth)
- [interface: Composable](#interface-composable)
    * [composable.getMethod()](#composablegetmethod)
    * [composable.getBody()](#composablegetbody)
    * [composable.validate()](#composablevalidate)
    * [composable.buildUrl(auth)](#composablebuildurlauth)


### class: Auth

Auth is the only class holding the mean to connect with Salesforce.  
It is required to execute any instance of classes implementing [Executable].
```js
const { Auth } = require('@digitregroup/salesforcer');

const auth = new Auth({
    apiVersion: 'v0.0',
    baseUrl: 'https://my.fake.tld',
    authUrl: 'https://auth.my.fake.tld',
    clientId: 'fakeClientId',
    clientSecret: 'fakeClientSecret',
    grantType: 'password',
    password: 'fakeValidPassword',
    username: 'fakeUsername',
});
```

#### constructor(authConfig)
- `authConfig` <[Object]>
  - `authUrl` <[string]> The Salesforce url to authentify againts.
  - `grantType` <[string]> The grant type to authenticate with Salesforce. 
  - `clientId` <[string]> The client id used to authenticate with Salesforce.
  - `clientSecret` <[string]> The client secret used to authenticate with Salesforce.
  - `username` <[string]> The username used to authenticate with Salesforce.
  - `password` <[string]> The password used to authenticate with Salesforce.
  - `baseUrl` <[string]> The base url of the Salesforce instance to be queried.
  - `apiVersion` <[string]> The default api version to be used with this connection.

#### auth.getApiVersion()
- returns: <[string]>

Returns the api version defined in Auth.

#### auth.getInstance()
- returns: <[Promise]<[string]>>

Returns the instance url returned by Salesforce when authenticating.  
*This data is cached in the object after succesfully authenticating a first time.*

#### auth.getToken()
- returns: <[Promise]<[string]>>

Returns the token returned by Salesforce when authenticating.  
*This data is cached in the object after succesfully authenticating a first time.*

#### auth.revoke()

Revoke the cached token by forgetting it so the authentication process can be rerun.


### class: Query

- implements: [Executable], [Composable]

The Query class represent a query in the Salesforce API.

```js
const { Auth, Query } = require('@digitregroup/salesforcer');

const auth = new Auth({ /* Ommited */ });
const query = new Query({
    query: 'select id from contact where name = \'Howard Jones\'',
    apiVersion: 'v46.0',
});

(async() => {
    const response = await query.execute(auth);
})();
```

#### constructor(queryConfig)
- `queryConfig` <[Object]>
  - `query` <[string]> The query to execute.
  - `apiVersion` <?[string]> The API version be used for this request (override apiVersion from Auth).

### class: SObjects

- implements: [Executable], [Composable]

The SObjects class allow record type API call against Salesforce API.  

```js
const { Auth, SObjects } = require('@digitregroup/salesforcer');

const auth = new Auth({ /* Ommited */ });
const sobject = new SObjects({
    method: 'POST',
    sobject: 'Task',
    params: ['@{NewAccount.id}'],
    qs: { fields: 'companyName' },
});

(async() => {
    const response = await sobject.execute(auth);
})();
```

#### constructor(sobjectConfig)
- `sobjectConfig` <[Object]>
  - `method` <[Method]> The HTTP method to use for this request.
  - `sobject` <[string]> The object name from Salesforce.
  - `body` <?[Object]> The body to be sent.
  - `params` <[Array]<[string]>> The parameters to add to the url..
  - `qs` <?[ParsedUrlQueryInput]> The query string to append to the url.
  - `apiVersion` <?[string]> The API version be used for this request (override apiVersion from Auth).

### class: Composite

- implements: [Executable]

A composite holds multiple requests implementing [Composable] to be sent in a single API call to salesforce.

```js
const { Auth, SObjects, Composite } = require('@digitregroup/salesforcer');

const auth = new Auth({ /* Ommited */ });
const composite = new Composite(true);
const testFirst = new SObjects({
    method: 'POST',
    sobject: 'Lead',
    body: { heck: 'yeah' },
});
const testNext = new SObjects({
    method: 'POST',
    sobject: 'Task',
    body: {sup: 'bruh', WhoId: '@{NewLead.id}'},
});
composite
    .add('NewLead', testFirst)
    .add('AddTask', testNext);

(async() => {
    const response = await composite.execute(auth);
})();
```

#### constructor(allOrNone, apiVersion)
- `allOrNone` <[boolean]> Should the request fail if any of its request fail.
- `apiVersion` <?[string]> The API version be used for this request (override apiVersion from Auth).

#### composite.add(referenceId, request)
- `referenceId` <[string]> The referenceId of the request.
- `request` <[Composable]> The request to add.
- returns: <[Composite]>

Add a request to the Composite.  
*This returns itself to be chainable.*

#### composite.getRequests()
- returns: <[Map]<[string], [Composite]>>

Returns the request already added to the Composite.

### interface: Executable 

The interface Executable define required methods for classes to be executed using an Auth instance.

#### executable.execute(auth)
- `auth` <[Auth]> The Auth instance used to connect to the Salesforce instance.
- returns: <[Promise]<[Object]>>

Execute the request defined by the class implementing this interface.  
Returned value differ depending on the implementing class.

### interface: Composable 

The interface Composable define required methods for classes to be used inside a Composite.  
Most of the methods returns request parts used to call the API.

#### composable.getMethod()
- returns: <[Method]>

Returns the method of the request.

#### composable.getBody()
- returns: <?[Object]>

Returns the request body (if existing) of the request.

#### composable.validate()
- returns: <[boolean]>

Validate the request before actually executing it.  
Throws on invalid requests.

#### composable.buildUrl(auth)
- `auth` <[Auth]> The Auth instance used to connect to the Salesforce instance.
- returns: <[Promise]<[string]>>

Build the API url associated with the request.


[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Objects "Object"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Indexed_collections_Arrays_and_typed_Arrays "Array"
[Map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map "Map"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[ParsedUrlQueryInput]: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/querystring.d.ts#L13 "ParsedUrlQueryInput"
[Method]: https://github.com/axios/axios/blob/v0.19.0/index.d.ts#L24 "Method"
[Executable]: #interface-executable
[Composable]: #interface-composable
[Auth]: #class-auth
[Composite]: #class-composite
