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

    /** Configured base URL for the API instance. */
    protected _baseURL: string;

    /** Build an API controller configured with the given settings. */
    constructor({ baseURL = "" }: APISettings = {}) {
        this._baseURL = this._cleanupStr(baseURL);
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
        { baseURL, query, ...fetchOpts }: APIFetchOptions<BodyType, QueryType>,
    ): Promise<ResponseType> {
        const url = this._getURL<QueryType>(path, query, baseURL);

        if (fetchOpts.body && typeof fetchOpts.body !== "string") {
            fetchOpts.body = JSON.stringify(fetchOpts.body) as BodyType;

            fetchOpts.headers ??= {};
            fetchOpts.headers["Content-type"] ??= "application/json";
        }

        try {
            const res = await fetch(url, fetchOpts as RequestInit);
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

    /** Run a GET request. */
    get<BodyType = unknown, ResponseType = unknown, QueryType = unknown>(
        path: string,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= this.methods.get;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
    }

    /** Run a POST request. */
    post<BodyType = unknown, ResponseType = unknown, QueryType = unknown>(
        path: string,
        body: BodyType,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= this.methods.post;
        fetchOpts.body = body;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
    }

    /** Run a PUT request. */
    put<BodyType = unknown, ResponseType = unknown, QueryType = unknown>(
        path: string,
        body: BodyType,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= this.methods.put;
        fetchOpts.body = body;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
    }

    /** Run a PATCH request. */
    patch<BodyType = unknown, ResponseType = unknown, QueryType = unknown>(
        path: string,
        body: BodyType,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= this.methods.patch;
        fetchOpts.body = body;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
    }

    /** Run a DELETE request. */
    delete<BodyType = unknown, ResponseType = unknown, QueryType = unknown>(
        path: string,
        fetchOpts: APIFetchOptions<BodyType, QueryType> = {},
    ) {
        fetchOpts.method ??= this.methods.delete;
        return this.fetch<BodyType, ResponseType, QueryType>(path, fetchOpts);
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
