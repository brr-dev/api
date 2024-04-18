// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

import api, { API } from "./index";

describe("api tests", () => {
    beforeAll(() => {
        // Mock the Fetch API before tests, we're only testing our wrapper
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
