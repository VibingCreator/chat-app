const chatOutput = document.querySelector(".chat__output");
const chatInputForm = document.querySelector(".input__message");
const chatInputData = document.querySelector(".message__data");
const chatInputIconEmergency = document.querySelector(".message__icon-emergency");
const chatInputIconSend = document.querySelector(".message__icon-send");
const chatOnlineCount = document.querySelector(".input__online-count");

const socket = io();

const createNotificationMessage = (data, description) => {
    const outputNotificationElement = document.createElement("div");
    
    outputNotificationElement.classList.add("output__notification");

    outputNotificationElement.textContent = `${ data } ${ description }`;

    chatOutput.appendChild(outputNotificationElement);

    chatOutput.scrollTop = chatOutput.scrollHeight
}

const createSenderMessage = (data) => {
    if (chatOutput.lastChild?.classList.contains("output__sender")) {
        const senderDataElement = document.createElement("div");
        const dataContentElement = document.createElement("div");
        const dataTimestampElement = document.createElement("div");
        
        senderDataElement.classList.add("sender__data");
        dataContentElement.classList.add("data__content");
        dataTimestampElement.classList.add("data__timestamp");
    
        dataContentElement.textContent = data.data;
        dataTimestampElement.textContent = data.timestamp;
    
        senderDataElement.appendChild(dataContentElement);
        senderDataElement.appendChild(dataTimestampElement);
    
        chatOutput.lastChild.appendChild(senderDataElement);
    } else {
        const outputSenderElement = document.createElement("div");
        const senderDataElement = document.createElement("div");
        const dataContentElement = document.createElement("div");
        const dataTimestampElement = document.createElement("div");
        
        outputSenderElement.classList.add("output__sender");
        senderDataElement.classList.add("sender__data");
        dataContentElement.classList.add("data__content");
        dataTimestampElement.classList.add("data__timestamp");
    
        dataContentElement.textContent = data.data;
        dataTimestampElement.textContent = data.timestamp;
    
        outputSenderElement.appendChild(senderDataElement);
        senderDataElement.appendChild(dataContentElement);
        senderDataElement.appendChild(dataTimestampElement);
    
        chatOutput.appendChild(outputSenderElement);
    }

    chatOutput.scrollTop = chatOutput.scrollHeight
}

const createRecipientMessage = (data) => {
    if (chatOutput.lastChild?.childNodes[0].textContent === data.sender) {
        const recipientDataElement = document.createElement("div");
        const dataContentElement = document.createElement("div");
        const dataTimestampElement = document.createElement("div");

        recipientDataElement.classList.add("recipient__data");
        dataContentElement.classList.add("data__content");
        dataTimestampElement.classList.add("data__timestamp");

        dataContentElement.textContent = data.data;
        dataTimestampElement.textContent = data.timestamp;

        recipientDataElement.appendChild(dataContentElement);
        recipientDataElement.appendChild(dataTimestampElement);
    
        chatOutput.lastChild.appendChild(recipientDataElement);
    } else {
        const outputRecipientElement = document.createElement("div");
        const recipientSenderElement = document.createElement("div");
        const recipientDataElement = document.createElement("div");
        const dataContentElement = document.createElement("div");
        const dataTimestampElement = document.createElement("div");
    
        outputRecipientElement.classList.add("output__recipient");
        recipientSenderElement.classList.add("recipient__sender");
        recipientDataElement.classList.add("recipient__data");
        dataContentElement.classList.add("data__content");
        dataTimestampElement.classList.add("data__timestamp");
    
        recipientSenderElement.textContent = data.sender;
        dataContentElement.textContent = data.data;
        dataTimestampElement.textContent = data.timestamp;
    
        outputRecipientElement.appendChild(recipientSenderElement);
        outputRecipientElement.appendChild(recipientDataElement);
        recipientDataElement.appendChild(dataContentElement);
        recipientDataElement.appendChild(dataTimestampElement);
    
        chatOutput.appendChild(outputRecipientElement);
    }

    chatOutput.scrollTop = chatOutput.scrollHeight
}

chatInputForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!chatInputData.value) return;

    createSenderMessage({
        data: chatInputData.value,
        timestamp: new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })
    });

    socket.emit("chatMessage", {
        type: "message",
        sender: socket.id,
        data: chatInputData.value
    });

    chatInputForm.reset();
});

chatInputIconEmergency.addEventListener("click", (event) => {
    socket.emit("chatEmergency", {
        type: "notification",
        sender: socket.id,
        data: "pressed the emergency button!"
    });

    chatOutput.replaceChildren();
});

socket.on("connect", () => {
    socket.emit("chatConnect", socket.id);
});

socket.on("chatConnect", (data) => {
    createNotificationMessage(data, "joined the party!");
});

socket.on("chatDisconnect", (data) => {
    createNotificationMessage(data, "left the party!");
});

socket.on("chatMessage", (data) => {
    data.timestamp = new Date(data.timestamp).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
    createRecipientMessage(data);
});

socket.on("chatOnlineCount", (data) => {
    chatOnlineCount.textContent = `Online: ${data}`;
});

socket.on("chatBuffer", (data) => {
    for (const buffer of data) {
        if (buffer.type === "message") {
            buffer.timestamp = new Date(buffer.timestamp).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
            createRecipientMessage(buffer);
        } else if (buffer.type === "notification") {
            createNotificationMessage(buffer.sender, buffer.data);
        }
    }
});

socket.on("chatEmergency", (data) => {
    chatOutput.replaceChildren();
    createNotificationMessage(data.sender, data.data);
});