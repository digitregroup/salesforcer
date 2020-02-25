# Salesforcer

<p>
  <a href="https://github.com/digitregroup/salesforcer/actions?query=workflow%3ACI+event%3Apush+branch%3Amaster">
    <img src="https://github.com/digitregroup/salesforcer/workflows/CI/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/@digitregroup/salesforcer">
    <img src="https://img.shields.io/npm/v/@digitregroup/salesforcer">
  </a>
</p>


Salesforcer is a wrapper around SalesForce API allowing to simply build single and composite requests.    
It uses [axios](https://github.com/axios/axios) to make HTTP requests.

**LIMITATIONS AND DISCLAIMER**  
This library is in [pre 1.0.0 state](https://semver.org/#spec-item-4). Api and structure can change and break frequently.  
Currently only `sobjects`, `query` and `composite` requests are supported.


## Documentation
You can check the documentation [here](./docs/api.md).

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
const {Auth, SObjects} = require('@digitregroup/salesforcer');
const auth = new Auth({ /* Ommited */ });

const so = new SObjects({
    method: 'POST',
    sobject: 'Task',
    body: { foo: 'bar' },
});

const response = await so.execute(auth);
```

### Composite example

```js
const {Auth, SObjects, Composite} = require('@digitregroup/salesforcer');
const auth = new Auth({ /* Ommited */ });

const composite = new Composite(true);
composite
    .add('NewLead', new SObjects({
        method: 'POST',
        sobject: 'Lead',
        body: { foo: 'bar' },
    }))
    .add('AddTask', new SObjects({
        method: 'POST',
        sobject: 'Task',
        body: { bar: 'baz', WhoId: '@{NewLead.id}' },
    }));

const response = await composite.execute(auth);
```


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
