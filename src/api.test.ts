// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

import { api } from "./api";
import API from "./API.class";
import { mockFetchRes, spyOnFetch } from "@brr-dev/testing";

describe("api tests", () => {
    let fetchSpy: jest.SpyInstance;

    beforeAll(() => {
        fetchSpy = spyOnFetch();
    });

    afterAll(() => {
        fetchSpy.mockRestore();
    });

    beforeEach(() => {
        fetchSpy.mockClear();
    });

    describe("module", () => {
        it("exports a prebuilt instance of the API class", () => {
            expect(api).toBeInstanceOf(API);
        });
    });

    describe("api.create()", () => {
        it("can create a new API controller", () => {
            expect(api.create()).toBeInstanceOf(API);
        });

        it("can create a new instance of an API subclass", () => {
            class _TestAPI extends API {}
            const _testAPI = new _TestAPI();

            expect(_testAPI).toBeInstanceOf(API);
            expect(_testAPI).toBeInstanceOf(_TestAPI);
            expect(_testAPI.create()).toBeInstanceOf(_TestAPI);
        });
    });

    describe("api.fetch()", () => {
        it("doesn't throw when calling fetch with no params", () => {
            return expect(api.fetch()).resolves.not.toBeUndefined();
        });

        it("correctly calls fetch and returns the expected data (simple)", async () => {
            const url = "https://fake.site/v1/test";

            const response = "test-response";
            mockFetchRes({ response });

            expect(fetchSpy).toHaveBeenCalledTimes(0);

            const fetchRes = await api.fetch(url);
            expect(fetchRes).toBe(response);

            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledWith(url, expect.any(Object));
        });

        it("correctly calls fetch and returns the expected data (complex)", async () => {
            const path = "/v1/test";
            const baseURL = "https://fake.site";
            const query = { test: false };
            const _expectedURL = "https://fake.site/v1/test?test=false";

            const response = "test-response";
            mockFetchRes({ response });

            expect(fetchSpy).toHaveBeenCalledTimes(0);

            const fetchRes = await api.fetch(path, { baseURL, query });
            expect(fetchRes).toBe(response);

            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledWith(
                _expectedURL,
                expect.any(Object),
            );
        });

        it("correctly stringifies JSON passed in the request body", async () => {
            // Also spy on JSON.stringify for this function call
            const jsonStringifySpy = jest.spyOn(JSON, "stringify");

            const url = "https://fake.site/v1/test";
            const body = { ok: true };
            const _expectedBodyStr = '{"ok":true}';

            expect(fetchSpy).toHaveBeenCalledTimes(0);
            expect(jsonStringifySpy).toHaveBeenCalledTimes(0);

            await api.fetch(url, { body });

            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledWith(
                url,
                expect.objectContaining({
                    body: _expectedBodyStr,
                    headers: expect.objectContaining({
                        "Content-type": "application/json",
                    }),
                }),
            );

            expect(jsonStringifySpy).toHaveBeenCalledTimes(1);
            expect(jsonStringifySpy).toHaveBeenCalledWith(body);
            expect(jsonStringifySpy).toHaveReturnedWith(_expectedBodyStr);

            jsonStringifySpy.mockRestore();
        });
    });

    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
        describe(`api.${method}()`, () => {
            it("correctly calls fetch with the proper method set", async () => {
                await api[method]("");
                expect(fetchSpy).toHaveBeenCalledWith(
                    "",
                    expect.objectContaining({ method: api.methods[method] }),
                );
            });
        });
    }
});
