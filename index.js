import express from "express";

const app = express();

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

app.use("/", express.static("public"));

app.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
});
