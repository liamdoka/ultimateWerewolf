"use strict";

const USERNAME_KEY = "current_username_token";
const ROOM_KEY = "current_room_token";
const username_field = document.querySelector("#username")
const room_field = document.querySelector("#room")

const client = io();

function createGame(){
    if (stripHTML(username_field.value)) {
        
        var username = stripHTML(username_field.value)
        localStorage.setItem(USERNAME_KEY, username);
        var code = generateCode();
        client.emit("createRoom", code);
        client.emit("joinRoom", {nickname: username, roomcode: code})
    }
}

function joinGame() {
    if (stripHTML(username_field.value) && room_field.value) {
        var username = stripHTML(username_field.value)
        localStorage.setItem(USERNAME_KEY, username);
        client.emit('joinRoom', ({nickname: username, roomcode: room_field.value.toUpperCase()}));
    }  
}

client.on('createErr', (err) => createGame());
client.on('joinErr', (err) => {console.log(err)})

// Join Room on Enter
room_field.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        joinGame()
    }
});

function generateCode() {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    for ( var i = 0; i < 4; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function stripHTML(str) {
    var x = str.replace("<", "");
    x = x.replace(">", "");
    return x
}

client.on('joinRoomValid', code => {
    localStorage.setItem(ROOM_KEY, code)
    window.location.href = "/home";
});

var username = localStorage.getItem(USERNAME_KEY)
if (username) {
    username_field.value = username 
}