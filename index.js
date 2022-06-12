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
let chatTyping = new Set();

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

        chatTyping.delete(data.sender);
        socket.broadcast.emit("chatStopTyping", Array.from(chatTyping));
        
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

    socket.on("chatStartTyping", (data) => {
        chatTyping.add(data);
        socket.broadcast.emit("chatStartTyping", Array.from(chatTyping));
    });

    socket.on("chatStopTyping", (data) => {
        chatTyping.delete(data);        
        socket.broadcast.emit("chatStopTyping", Array.from(chatTyping));
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

        chatTyping.delete(socket.id);
        socket.broadcast.emit("chatStopTyping", Array.from(chatTyping));
    })
});

httpServer.listen(port, () => {
    console.log(`http://127.0.0.1:${port}`);
});