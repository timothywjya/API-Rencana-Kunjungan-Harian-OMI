import express from "express";

const app = express();

app.get("/test", function (req, res) {
    res.send("Hello World");
});

app.listen(3000, () => {
    // console.info(`Your server ${app.link}`);

    console.log("Listening on localhost:3000");
});
