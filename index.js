import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = process.env.PORT || 3000;

app.use("/", express.static("public"));

let chatOnlineCount = 0;
let chatBuffer = [];

io.on("connection", (socket) => {
    console.log("connection established");

    chatOnlineCount = chatOnlineCount + 1;

    io.emit("chatOnlineCount", chatOnlineCount);

    socket.emit("chatBuffer", chatBuffer);

    socket.on("chatConnect", (data) => {
        if (chatBuffer.length >= 100) {
            chatBuffer.shift();
        }

        chatBuffer.push({
            type: "notification",
            sender: data,
            data: "joined the party!"
        });

        socket.broadcast.emit("chatConnect", data);
    });

    socket.on("chatMessage", (data) => {
        data.timestamp = new Date();
        socket.broadcast.emit("chatMessage", data);

        if (chatBuffer.length >= 100) {
            chatBuffer.shift();
        }

        chatBuffer.push(data);
    });
    
    socket.on("chatEmergency", (data) => {
        chatBuffer = [];
        chatBuffer.push(data);
        socket.broadcast.emit("chatEmergency", data);
    });

    socket.on("disconnect", (reason) => {
        console.log(`connection closed (${reason})`);

        chatOnlineCount = chatOnlineCount - 1;

        io.emit("chatOnlineCount", chatOnlineCount);

        socket.broadcast.emit("chatDisconnect", socket.id);
        
        if (chatBuffer.length >= 100) {
            chatBuffer.shift();
        }

        chatBuffer.push({
            type: "notification",
            sender: socket.id,
            data: "left the party!"
        });
    })
});

httpServer.listen(port, () => {
    console.log(`http://127.0.0.1:${port}`);
});