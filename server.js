const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");
const formatMessage = require('./utils/chatMsg');

// initalize app
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.get('/', (req, res) => {
    res.sendFile('/templates/index.html', { root: __dirname });
});

app.get('/home', (req, res) => {
    res.sendFile('/templates/home.html', { root: __dirname });
})

app.get('/tests', (req, res) => {
    res.sendFile('/templates/testing_ground.html', { root: __dirname});
})

// ACTIVE ROOMS IS AN "ASSOCIATIVE" ARRAY OF ROOM OBJECTS
const active_rooms = {};

// run when client connects
io.on('connection', socket => {

    // when client tries to join room
    socket.on("joinRoom", user => {
        //  check if room exists via roomcode
        var room_id = "_room_" + user.roomcode;
        if (active_rooms[room_id]) {
            // check if playername exists in room
            if (active_rooms[room_id].players.includes(user.nickname)) {
                socket.emit('joinErr', 'Nickname already exists in that room')
            } else {
                // add player name to room
                nickname = user.nickname
                active_rooms[room_id].players.push(nickname);
                socket.emit("joinRoomValid", user.roomcode);

                // send notification to all users in the room
                socket.in(room_id).emit("room!", active_rooms[room_id])
            }
        } else {
            socket.emit('joinErr', 'Chosen Room does not exist')
        }
    })
    
    // when a new room is created
    socket.on("createRoom", code => {
        var room_id = "_room_" + code;
        // check if room exists
        if (!active_rooms[room_id]) {
            active_rooms[room_id] = {
                players: [],
                active_deck: [0],
                players_ready: [],
                state: ""
            }
        } else {
            socket.emit("createErr", "bruh");
        }
    })

    socket.on("room?", code => {

        // IF ALREADY IN ROOM :: TODO
        if ([...socket.rooms][1]) {}

        // JOIN ROOM
        var room_id = "_room_" + code;
        socket.join(room_id)
        socket.emit("room!", active_rooms[room_id])
    })

    // this runs when the client loads into the server
    socket.emit('message', formatMessage("Server", "Welcome to Ultimate Werewolf"))
    
    // send a chat specifically to this room
    socket.on('chat', (chat) => {
        var room_id = "_room_" + chat.room;
        io.to(room_id).emit('message', formatMessage(chat.user, chat.text))
    })


    socket.on('cardClick', (card) => {

        // get the list of connected sockets in the room
        var current_room = [...socket.rooms][1];

        // if the active deck already has the card
        if (active_rooms[current_room].active_deck.includes(card)) {
            for (let i = 0; i < active_rooms[current_room].active_deck.length; i++) {
                const active_card = active_rooms[current_room].active_deck[i];
                if (active_card == card) {
                    // remove the card
                    active_rooms[current_room].active_deck.splice(i, 1)
                }
            }
        } else {
            // else add the card
            active_rooms[current_room].active_deck.push(card);
        }
        // tell everyone that we added a card
        io.to(current_room).emit('deck!', active_rooms[current_room].active_deck);
        
    })

    socket.on('time?', time => {
        var current_room = [...socket.rooms][1];
        socket.to(current_room).emit('time!', time)
    })


    socket.on('ready?', nickname => {
        var current_room = [...socket.rooms][1]

        if (!active_rooms[current_room].players_ready.includes(nickname)) {
            active_rooms[current_room].players_ready.push(nickname)


            // check the game start conditions.

            if (active_rooms[current_room].players_ready.length == active_rooms[current_room].players.length) {
                if (active_rooms[current_room].players.length >= 2) {
                    
                    active_rooms[current_room].state = "started"
                    io.to(current_room).emit('startGame', active_rooms[current_room])

                }
            }

        } else {
            for (let i = 0; i < active_rooms[current_room].players_ready.length; i++) {
                if (active_rooms[current_room].players_ready[i] == nickname) {
                    // remove the user
                    active_rooms[current_room].players_ready.splice(i, 1)
                }
            }
        }

        if (active_rooms[current_room].state != "started") {
            io.to(current_room).emit('room!', active_rooms[current_room])
        }
    })

    // run when a client disconnects
    socket.on('disconnecting', () => {

        if (socket.rooms.size > 1) {
            // converts maps and sets into arrays
            var current_room = [...socket.rooms][1];
            var room_sockets = [...io.sockets.adapter.rooms.get(current_room)]
            var active_players = active_rooms[current_room].players.length

            // checks to see if the socket id matches the one in the active room
            for (let i = 0; i < active_players; i++) {
                if (room_sockets[i] == socket.id) {
                    active_rooms[current_room].players.splice(i, 1);

                    if (active_rooms[current_room].players.length == 0) {
                        delete active_rooms[current_room];
                    }
                    break;
                }
            }
            // make all clients update their lobby
            if (active_rooms[current_room]) {
                socket.to(current_room).emit("room!", active_rooms[current_room])
            }
        }
    })

});

// run server
const PORT = 8000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`Werewolf listening on port ${PORT}...`)
})