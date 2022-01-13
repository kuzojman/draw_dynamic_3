
const express = require('express');
const { Server } = require("socket.io");
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000


app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendfile('/index.html');
});

io.on('connection', (socket) => 
{

    socket.on('mouse:move', e => {
        socket.broadcast.emit('mouse:move', e)
    });

    socket.on('disconnect', () => 
    {
        console.log('user disconnected');
    });
});

server.listen(port,() => {
    console.log(`Server running at port `+port);
  });
