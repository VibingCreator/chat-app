import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

app.use("/", express.static("public"));

io.on("connection", (socket) => {
    console.log("connection established");

    socket.on("disconnect", (reason) => {
        console.log(`connection closed (${reason})`);
    })
});

httpServer.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
});