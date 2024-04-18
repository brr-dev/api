# `api`

A simple wrapper around the Fetch API that provides automatic JSON request/response handling and generic typing.

## Installation

You can easily add the public package to any Node project:

```shell
# npm
npm install @brr-dev/api

# yarn
yarn add @brr-dev/api
```

## Usage

It's recommended to create a module for the API calls you need, and to preconfigure any APIs that need authorization or have a base URL.

```javascript
// /src/data/fakeSite/fakeAPI.js
export const fakeAPI = api.create({
    baseURL: "https://fake.site",
    headers: { Authorization: "Bearer FakeTokenFakeToken-FakeTokenFakeToken" },
});

// /src/data/fakeSite/trees.js
export function getTrees(options) {
    return fakeAPI.get("/v1/trees", options);
}
export function addTrees(newTrees, options) {
    return fakeAPI.post("/v1/trees", newTrees, options);
}

// /src/data/fakeSite/index.js
export * as trees from "./trees.js";
export { myAPI } from "./myAPI.js";

// /src/data/index.js
export * as FakeSite from "./fakeSite";
```

Then you can use it pretty simply, with decent namespacing:

```javascript
import { FakeSite } from "/src/data";
const theTrees = await FakeSite.trees.getTrees();
```

## Public Methods

All of these public `.fetch()` methods have generic type parameters so that you can optionally add more type safety to your request and response data. For example, if I'm doing a post request where I'm sending updated objects, and I'm expecting an array of all of the object ids as a response, I could create a helper function like this in my data module:

```typescript
type MyObject = { id: number; name: string };

function updateObjects(...newObjects: MyObject[]) {
    return api.post<MyObject[], number[]>("/fake/site", newObjects);
}
```

### `.fetch(path, options)`

This method does most of the work of our wrapper.

-   It builds the URL for the request based on options and configuration
-   It parses and encodes request and response body JSON
-   It converts a custom `query` option to a proper query string

> The standard `fetch()` already includes a `body` property on the request object, but we just add another layer of handling. If the `body` property you pass in is not a string, then the `body` will be replaced with a JSON string of itself, and the `content-type` header will be set to `application/json`.

> Instead of having to build the URL query string yourself (eg. "?date=2024-01-01), you can pass it to the `query` property on the options object:
>
> ```javascript
> // This will add "?date=2024-01-01" to the URL
> api.fetch("/fake", {
>     query: { date: "2024-01-01" },
> });
> ```

We also have the following public methods, which are just wrappers around the API's `.fetch()` method, but with default HTTP methods set. Notice that some of them also include a second "body" argument.

-   `.get(path, options)`
-   `.post(path, body, options)`
-   `.put(path, body, options)`
-   `.patch(path, body, options)`
-   `.delete(path, options)`

### `.create(config)`

Create a new api object with all the same methods from a given configuration object. The configuration object can specify default `headers` and a default `baseURL`.

```javascript
const DemoAPI = api.create({
    baseURL: "https://fake.site",
    headers: {
        Authorization: `Bearer FakeToken-FakeToken-FakeToken`,
    },
});

// GET https://fake.site/v1/fake (w/ Authorization header)
await DemoAPI.get("/v1/fake");
```

## Public Properties

### `methods`

Constants for HTTP methods.

## Protected Properties and Methods

### `protected _baseURL: string`

This is the configured base URL for the API. This will be used as the base and combined with any passed-in `path` values to create the full request URL. Defaults to an empty string.

### `protected _getURL(path, query, baseURL): string`

This is the method that builds the URL of the fetch request from the various bits of config. This includes any values passed to `baseURL`, `path`, and `query`.

### `protected _cleanupStr(str): string`

A helper method that strips whitespace and trailing/leading "/" characters from the URL parts so we can build our URLs predictably and consistently.
