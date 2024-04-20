// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

import api, { API } from "./index";
import { spyOnFetch } from "@brr-dev/testing";

describe("api tests", () => {
    let fetchSpy: jest.SpyInstance;

    beforeAll(() => {
        fetchSpy = spyOnFetch();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should export an API class", () => {
        expect(api).not.toBeUndefined();
    });

    it("can create a new API controller", () => {
        expect(api.create({ baseURL: "test" })).toBeInstanceOf(API);
    });
});
