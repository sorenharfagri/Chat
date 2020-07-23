const express = require ('express');
const socketio = require ('socket.io');
const http = require ('http');
const app = express();

const PORT =  process.env.PORT || 80;
const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server is working on port ${PORT}`));

const io = socketio(server);

const chatSockets = require("./chatSockets/chatSockets.js")(io)


app.get("/", (req, res) => {
   res.send({ response: "Server is up and running." }).status(200);
});