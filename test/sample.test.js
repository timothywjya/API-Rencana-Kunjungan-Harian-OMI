import express from "express";

const app = express();

app.get("/", function (req, res) {
  res.send("data");
});

describe("Sample", () => {
  test("two plus two is four", () => {
    const data = expect(2 + 2).toBe(4);

    console.info(data);
  });

  test("test api", async () => {
    // const data = await api.get("/").then;
  });
});
