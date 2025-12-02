import { web } from "../src/application/web.js";
import supertest from "supertest";
import { prismaClient } from "../src/application/database";
import { logger } from "../src/application/logging.js";
import { removeTestUser } from "./test-util.js";

describe("POST /api/users", function () {
    afterEach(async () => {
        await removeTestUser();
    });

    it("should can register new user", async () => {
        const result = await supertest(web).post("/api/users").send({
            username: "test",
            password: "rahasia",
            name: "test",
        });

        logger.info(result);
        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("test");
        expect(result.body.data.name).toBe("test");
        expect(result.body.data.password).toBeUndefined();
    });

    it("should can register new user with validate empty", async () => {
        const result = await supertest(web).post("/api/users").send({
            username: "",
            password: "",
            name: "",
        });

        logger.info(result.body);
        expect(result.status).toBe(400);
    });

    it("should reject if username already registered", async () => {
        let result = await supertest(web).post("/api/users").send({
            username: "test",
            password: "rahasia",
            name: "test",
        });

        logger.info(result);

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("test");
    });
});
