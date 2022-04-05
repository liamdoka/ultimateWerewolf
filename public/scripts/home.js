"use strict";

const chatbox = document.querySelector('.chatbox__content--read');
const messagelist = document.querySelector(".messagelist");
const playerlist = document.querySelector(".lobby__content--memberlist");
const cardlist = document.querySelector(".cardlist");
const textfield = document.querySelector(".chatbox__content--write-textfield");
const discussiontime = document.querySelector('.discussion-time');
const playerCount = document.querySelector(".lobby__foot");
const ready_btn = document.querySelector('.game-ready');
const card_count = document.querySelector('.card__count');

const USERNAME_KEY = "current_username_token";
const username = localStorage.getItem(USERNAME_KEY);

const ROOM_KEY = "current_room_token";
const room = localStorage.getItem(ROOM_KEY);
localStorage.removeItem(ROOM_KEY);

const deck = ["BLU Spy", "BLU Spy", "BLU Spy", "Soldier", "Soldier", "Soldier", "Scout", "Pyro", "Engineer", "Demoman", "Medic", "Medic", "Sniper", "Heavy", "Spy"];

// SCROLL THE CHAT TO THE BOTTOM
function autoScrollChat() {
    chatbox.scrollTop = chatbox.scrollHeight - chatbox.clientHeight;
}

// intialize client
const client = io()

// UPON RECEIVING A MESSAGE - UPDATE CHATBOX
client.on('message', msg => {
    addChatMessage(msg)
    autoScrollChat()
});


var current_lobby = {players:[0]};

// EVERYTIME A PLAYER JOINS
client.on("room!", lobby => {
    current_lobby = lobby;

    drawDeck(lobby.active_deck)
    drawLobby(current_lobby);
    if (isLobbyLeader()) {
        discussiontime.removeAttribute("disabled")
    }
});

// EVERYTIME THE DECK CHANGES
client.on('deck!', deck => {
    drawDeck(deck)
})

// EVERYTIME THE TIME CHANGES
client.on('time!', time => {
    discussiontime.value = time;
})


// ADD A MESSAGE TO THE MESSAGE LIST
function addChatMessage(message) {
    if (message.user == username) {
        messagelist.innerHTML += `           
            <li class="message" style="text-align: right;">
                <div class="message__meta">
                    <span class="message__meta--time">` + message.time + `</span>    
                    <span> &bull;</span>                           
                    <span class="message__meta--user">You</span>
                </div>
                <div class="message__text">` + message.text + `</div>
            </li>
        `;
    } else if (message.user.includes("Server")) {
        messagelist.innerHTML += `            
            <li class="message" style="text-align: center; font-size:16px">
                <div class="message__text">` + message.text + `</div>
            </li>
        `;
    } else {
        messagelist.innerHTML += `    
            <li class="message">
                <div class="message__meta">
                    <span class="message__meta--user">` + message.user + `</span>
                    <span> &bull;</span>                           
                    <span class="message__meta--time">` + message.time + `</span>    
                </div>
                <div class="message__text">` + message.text + `</div>
            </li>
        `;
    }
}

function drawDeck(active_deck) {

    cardlist.innerHTML = '';

    for (let i = 0; i < deck.length; i++) {
        const card = deck[i];
        var selected = "not-selected";

        if (active_deck.includes(i)) { selected = "" }

        cardlist.innerHTML += `                                
        <li class="card" id="` + i + `" onclick='editDeck(` + i + `)'>
            <div class="card__container ` + selected + `">
                <img src="img/` + card.toLowerCase() + `.png" alt="` + card + `" class="card__image">
                <div class="card__name">`+ card + `</div>
            </div>
        </li>`;   
    }

    card_count.innerHTML = active_deck.length + "/" + (current_lobby.players.length + 3) + " cards"
}

function drawLobby(lobby) {
    playerlist.innerHTML = '';
    var sorted_players = [...lobby.players].sort()
    for (let id = 0; id < sorted_players.length; id++) {
        var icon = "";
        var ready = ""
        const player = sorted_players[id];

        if (player == lobby.players[0]) {icon = "stars"}
        if (lobby.players_ready.includes(player)){ready = "game-ready__waiting"}

        playerlist.innerHTML += `
            <li class="member ` + ready + `">
                <span class="member__status">
                    <span class="material-icons">` + icon + `</span>
                </span>
                <span class="member__nickname">`+ player +`</span>
            </li>`;
    }

    playerCount.innerHTML = sorted_players.length + "/10"
}

function sendChatMessage() {
    var msg = textfield.value
    if (msg.trim()) {

        // remove any html tags
        msg = msg.replace("<", "");
        msg = msg.replace(">", "");

        // send message and username to the server
        client.emit('chat', ({user: username, text: msg, room: room}))
        textfield.value = "";
    }    
}

// ATTACHED TO EACH CARD
function editDeck(card_num) {
    if (isLobbyLeader()) {
        client.emit('cardClick', card_num);
    }
}

// SEND MESSAGE TO SERVER ON "ENTER"
textfield.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        sendChatMessage()
    };
})

ready_btn.addEventListener("click", () => {
    
    if (isLobbyLeader()) {
        if (card_count.innerHTML[0] < (card_count.innerHTML[2] + card_count.innerHTML[3]).trim()) {
            return
        }
    }

    if (!ready_btn.classList.contains("game-ready__waiting")) {
        ready_btn.classList.add("game-ready__waiting")
        ready_btn.innerHTML = "Waiting...";
    } else {
        ready_btn.classList.remove("game-ready__waiting")
        ready_btn.innerHTML = "Ready"
    }

    client.emit("ready?", username)
})


function isLobbyLeader() {
    return current_lobby.players[0] == username;
}

// UPDATE THE DISCUSSION TIME FOR EVERYONE
discussiontime.addEventListener("input", () => {
    discussiontime.value = discussiontime.value.slice(0,discussiontime.maxLength)
    var time = discussiontime.value
    client.emit('time?', time)
});

const roomcode_txt = document.querySelector('.roomcode__code');
const roomcode_btn = document.querySelector('.roomcode__toggle');
roomcode_txt.value = room;

// HIDE THE ROOMCODE ON CLICK
roomcode_btn.addEventListener('click', () => {
    if (roomcode_txt.type == "password") {
        // SET THE ROOMCODE TO DOTS
        roomcode_txt.removeAttribute('type');
        roomcode_txt.style.fontSize = '18px'

        // CHANGE THE ICON
        roomcode_btn.querySelector('.material-icons').innerHTML = "visibility";

    } else {
        roomcode_txt.style.fontSize = '30px'
        roomcode_txt.setAttribute("type", "password");
        roomcode_btn.querySelector('.material-icons').innerHTML = "visibility_off";
    }
})

// ::TO DO::
// COPY CODE TO CLIPBOARD ON CLICK



// RUN THIS FUNCTION ONCE UPON JOINING
function init() {
    // Make sure localstorage is set correctly
    if (username == undefined || room == undefined) {
        window.location.replace('/')
    }
    
    // ENSURE SCROLLBAR REMAINS AT BOTTOM FOR NEW MESSAGE
    autoScrollChat();

    // DRAW THE LOBBY JUST ONCE
    client.emit("room?", room);
}

init()