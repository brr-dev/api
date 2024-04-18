// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

export type APISettings = {
    baseURL?: string;
};

export type APIFetchOptions<
    BodyType = unknown,
    QueryType = Record<string, string>,
> = Omit<RequestInit, "body" | "headers"> &
    APISettings & {
        query?: QueryType;
        method?: string;
        body?: BodyType;
        headers?: Record<string, string>;
    };
