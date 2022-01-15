
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

    socket.on('mouse:move', e => 
    {
        socket.broadcast.emit('mouse:move', e)
    });

    socket.on('color:change', colour => 
    {
        socket.broadcast.emit('color:change', colour);
    });

    socket.on('width:change', width_pass => 
    {
        socket.broadcast.emit('width:change', width_pass);
    });


    socket.on('circle:edit', circle_pass => 
    {
        socket.broadcast.emit('circle:edit', circle_pass);
    });

    socket.on('circle:add', circle_pass => 
    {
        socket.broadcast.emit('circle:add', circle_pass);
    });


    socket.on('disconnect', () => 
    {
        console.log('user disconnected');
    });
});

server.listen(port,() => {
    console.log(`Server running at port `+port);
  });
