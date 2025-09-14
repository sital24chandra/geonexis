const express  = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require("socket.io");
const fs = require("fs");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Load geofence data
const geofences = JSON.parse(fs.readFileSync("geofence.json", "utf8"));

io.on("connection", function (socket){
    socket.on("send-location", function (data){
        io.emit("receive-location", {id: socket.id, ...data});
    });
    
    socket.on("disconnect", function(){
        io.emit("user-disconnected", socket.id);
        console.log("Disconnected");
    });

    console.log("Connected");
});

app.get("/", function (req, res) {
    res.render("index", { geofences });
});

server.listen(80, () => {
    console.log("Server running on http://localhost");
});