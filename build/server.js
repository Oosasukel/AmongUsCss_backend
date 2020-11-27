"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var http_1 = __importDefault(require("http"));
var httpServer = http_1.default.createServer();
var PORT = process.env.PORT || 3000;
var AllColors = [
    'red',
    'purple',
    'cyan',
    'black',
    'yellow',
    'lime',
    'green',
    'orange',
    'white',
    'blue',
    'brown',
    'pink',
    'gray',
    'teal',
    'gold',
    'silver',
    'maroon',
    'peach',
];
var colorsAvailable = __spreadArrays(AllColors);
function getRandomColor() {
    if (colorsAvailable.length > 0) {
        var randomIndex = Math.floor(Math.random() * colorsAvailable.length);
        var color = colorsAvailable[randomIndex];
        colorsAvailable.splice(randomIndex, 1);
        return color;
    }
    else {
        var randomIndex = Math.floor(Math.random() * AllColors.length);
        var color = AllColors[randomIndex];
        return color;
    }
}
function addColorAvailable(color) {
    colorsAvailable.push(color);
}
var io = socket_io_1.default(httpServer, { serveClient: false });
var players = {};
var speed = 6;
io.on('connection', function (socket) {
    players[socket.id] = {
        top: 0,
        left: 0,
        walk: false,
        lookingLeft: false,
        color: getRandomColor(),
    };
    // Sending to the client
    socket.emit('setupPlayers', players);
    // Sending to all clients except sender
    socket.broadcast.emit('playerConnect', socket.id, players[socket.id].color);
    socket.on('moveX+', function () {
        players[socket.id].left += speed;
        players[socket.id].walk = true;
        players[socket.id].lookingLeft = false;
        socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    });
    socket.on('moveX-', function () {
        players[socket.id].left -= speed;
        players[socket.id].walk = true;
        players[socket.id].lookingLeft = true;
        socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    });
    socket.on('moveY+', function () {
        players[socket.id].top -= speed;
        players[socket.id].walk = true;
        socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    });
    socket.on('moveY-', function () {
        players[socket.id].top += speed;
        players[socket.id].walk = true;
        socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    });
    socket.on('stopMove', function () {
        players[socket.id].walk = false;
        socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    });
    socket.on('disconnect', function () {
        addColorAvailable(players[socket.id].color);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnect', socket.id);
        console.log(socket.id + " disconnected");
    });
    console.log(socket.id + " connected");
});
httpServer.listen(PORT, function () {
    console.log("Listening at port " + PORT);
});
