// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

import { APIFetchOptions, APISettings } from "./api.types";

export class API {
    /** Constants for the configured/available API methods. */
    public methods = {
        get: "GET",
        post: "POST",
        put: "PUT",
        patch: "PATCH",
        delete: "DELETE",
        connect: "CONNECT",
        options: "OPTIONS",
        trace: "TRACE",
    };

    /** Run a GET request. */
    get = makeFetchCaller(this.methods.get);

    /** Run a POST request. */
    post = makeFetchCallerWithBody(this.methods.post);

    /** Run a PUT request. */
    put = makeFetchCallerWithBody(this.methods.put);

    /** Run a PATCH request. */
    patch = makeFetchCallerWithBody(this.methods.patch);

    /** Run a DELETE request. */
    delete = makeFetchCaller(this.methods.delete);

    /** Configured base URL for the API instance. */
    protected _baseURL: string;

    /** Headers that get applied to every request. */
    protected _headers: Record<string, string>;

    /** Build an API controller configured with the given settings. */
    constructor({ baseURL = "", headers = {} }: APISettings = {}) {
        this._baseURL = this._cleanupStr(baseURL);
        this._headers = headers;
    }

    /** Create a new instance of the _API class with new defaults. */
    create(settings: APISettings) {
        return new API(settings);
    }

    /** A wrapper around the Fetch API. */
    async fetch<
        BodyType = unknown,
        ResponseType = unknown,
        QueryType = Record<string, string>,
    >(
        path: string,
        {
            baseURL,
            query,
            headers = {},
            ...fetchOpts
        }: APIFetchOptions<BodyType, QueryType>,
    ): Promise<ResponseType> {
        const url = this._getURL<QueryType>(path, query, baseURL);
        headers = Object.assign(this._headers, headers);

        if (fetchOpts.body && typeof fetchOpts.body !== "string") {
            fetchOpts.body = JSON.stringify(fetchOpts.body) as BodyType;
            headers["Content-type"] ??= "application/json";
        }

        try {
            const res = await fetch(url, {
                headers,
                ...fetchOpts,
            } as RequestInit);
            return await res.json();
        } catch (err) {
            // Log out the error
            // TODO add a config check to see if logging is enabled, or do this with a logger class
            console.error(
                "The following API request was unsuccessful and returned this error:",
            );
            console.log("URL:", url);
            console.log("FETCH OPTS:", fetchOpts);
            console.error(err);

            // We catch the error for logging purposes, now throw it again
            throw err;
        }
    }

    /** Build a URL string with the given inputs and configured defaults. */
    protected _getURL<QueryType = unknown>(
        path: string,
        query?: QueryType,
        baseURL?: string,
    ) {
        baseURL = baseURL ? this._cleanupStr(baseURL) : this._baseURL;
        path = this._cleanupStr(path);

        // Stringify our query params, if any.
        const queryStr = query
            ? `?${new URLSearchParams(query).toString()}`
            : "";

        // Return our URL parts as a composed URL string.
        return `${baseURL}/${path}${queryStr}`;
    }

    /** Strip whitespace and trailing/leading "/" characters. */
    protected _cleanupStr(str: string): string {
        return str.trim().replace(/^\/|\/$/g, "");
    }
}

/**
 * Creates a function with the following signature:
 * `(path: string, options: APIFetchOptions) => ResponseType`
 * This function applies a default `method` option based on the passed-in
 * value provided to this factory function.
 */
function makeFetchCaller(defaultMethod: string) {
    return function <
        BodyType = unknown,
        ResponseType = unknown,
        QueryType = unknown,
    >(
        this: API,
        path: string,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= defaultMethod;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
    };
}

/**
 * Creates a function with the following signature:
 * (path: string, body: BodyType, options: APIFetchOptions) => ResponseType
 * This function applies a default `method` option based on the passed-in
 * value provided to this factory function, and also adds the body from the
 * function arguments onto the options when calling `fetch`.
 */
function makeFetchCallerWithBody(defaultMethod: string) {
    return function <
        BodyType = unknown,
        ResponseType = unknown,
        QueryType = unknown,
    >(
        this: API,
        path: string,
        body: BodyType,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= defaultMethod;
        fetchOpts.body = body;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
    };
}
