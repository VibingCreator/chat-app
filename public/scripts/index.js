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
    
    chatOutput.scrollTop = chatOutput.scrollHeight
}

const createRecipientMessage = (data) => {
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

socket.on("connect", () => {
    socket.emit("chatConnect", socket.id);
    createNotificationMessage("You", "joined the party!");
});

socket.on("chatConnect", (data) => {
    if (data === socket.id) return;
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