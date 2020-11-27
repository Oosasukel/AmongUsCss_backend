import express from 'express';
import cors from 'cors';
import SocketIo from 'socket.io';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

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

const server = app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});

const io = SocketIo(server);

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
    players[socket.id].left += speed;
    players[socket.id].walk = true;
    players[socket.id].lookingLeft = false;

    socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
  });

  socket.on('moveX-', () => {
    players[socket.id].left -= speed;
    players[socket.id].walk = true;
    players[socket.id].lookingLeft = true;

    socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
  });

  socket.on('moveY+', () => {
    players[socket.id].top -= speed;
    players[socket.id].walk = true;

    socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
  });

  socket.on('moveY-', () => {
    players[socket.id].top += speed;
    players[socket.id].walk = true;

    socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
  });

  socket.on('stopMove', () => {
    players[socket.id].walk = false;

    socket.broadcast.emit('playerUpdate', socket.id, players[socket.id]);
  });

  socket.on('disconnect', () => {
    addColorAvailable(players[socket.id].color);

    delete players[socket.id];

    socket.broadcast.emit('playerDisconnect', socket.id);

    console.log(`${socket.id} disconnected`);
  });

  console.log(`${socket.id} connected`);
});
