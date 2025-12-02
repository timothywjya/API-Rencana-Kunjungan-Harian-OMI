import express from "express";
import request from "supertest";

const app = express();

app.get("/", (req, res) => {
  res.send("Test");
});

test("app get 1", async () => {
  const response = await request(app).get("/");
  expect(response.text).toBe("Test");
});
