// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

import api from "./index";

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
});
