// import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { prismaClient } from "../src/application/database";

export const removeTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: { username: "test" },
    });
};
