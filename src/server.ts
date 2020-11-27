import SocketIo from 'socket.io';
import http from 'http';
import express from 'express';

const PORT = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

const io = SocketIo(server);

const AllColors = [
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

let colorsAvailable = [...AllColors];

function getRandomColor() {
  if (colorsAvailable.length > 0) {
    const randomIndex = Math.floor(Math.random() * colorsAvailable.length);
    const color = colorsAvailable[randomIndex];
    colorsAvailable.splice(randomIndex, 1);
    return color;
  } else {
    const randomIndex = Math.floor(Math.random() * AllColors.length);
    const color = AllColors[randomIndex];

    return color;
  }
}

function addColorAvailable(color: string) {
  colorsAvailable.push(color);
}

const players: any = {};
const speed = 6;

io.on('connection', (socket) => {
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

  socket.on('moveX+', () => {
    if (players[socket.id]) {
      players[socket.id].left += speed;
      players[socket.id].walk = true;
      players[socket.id].lookingLeft = false;

      socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    }
  });

  socket.on('moveX-', () => {
    if (players[socket.id]) {
      players[socket.id].left -= speed;
      players[socket.id].walk = true;
      players[socket.id].lookingLeft = true;

      socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    }
  });

  socket.on('moveY+', () => {
    if (players[socket.id]) {
      players[socket.id].top -= speed;
      players[socket.id].walk = true;

      socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    }
  });

  socket.on('moveY-', () => {
    if (players[socket.id]) {
      players[socket.id].top += speed;
      players[socket.id].walk = true;

      socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    }
  });

  socket.on('stopMove', () => {
    if (players[socket.id]) {
      players[socket.id].walk = false;

      socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
    }
  });

  socket.on('disconnect', () => {
    addColorAvailable(players[socket.id].color);

    delete players[socket.id];

    socket.broadcast.emit('playerDisconnect', socket.id);

    console.log(`${socket.id} disconnected`);
  });

  console.log(`${socket.id} connected`);
});

server.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});
