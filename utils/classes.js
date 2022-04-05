class LobbyList {
    constructor() {
        this._lobbylist = [];
    }

    get lobbies() {
        return this._lobbylist;
    }

    addLobby(code) {
        
        // checks if the code exists, returns if it exists
        this._lobbylist.forEach(lobby => {
            if (code == lobby.code) {
                return
            }
        });

        // adds new lobby to lobbylist
        let lobby = new Lobby(code);
        this._lobbylist.push(lobby)
    }

    removeLobby(code) {
        for (let i = 0; i < this._lobbylist.length; i++) {
            const lobby = this._lobbylist[i];
            if (lobby.code == code) {
                this._lobbylist.splice(i)
                break
            }  
        }
    }
}


class Lobby {
    constructor(code) {
        this._code = code;
        this._players = [];
        this._deck = [];
        this._inProgress = false;
    }

    get code() {
        return this._code;
    }

    get inProgress() {
        return this._inProgress;
    }

    get players() {
        return this._players;
    }

    start() {
        this._inProgress = !this._inProgress;
    }

    full() {
        return this._players.length == 10;
    }

    setDeck(deck) {
        if (deck.length = this._players.length + 3) {
            this._deck = deck;
        }
    }
}


class Player {
    constructor(username) {
        this._username = username;
        this._leader = false;
        this._starting_card = null;
        this._current_card = null;
    }

    get username() {
        return this._username
    }

    get leader() {
        return this._leader;
    }

    get starting_card() {
        return this._starting_card;
    }

    get current_card() {
        return this._current_card;
    }

    setLeader() {
        this._leader = true;
    }
}

class Card {
    constructor (name) {
        this._name = name;
        this._description = "";
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    set description(txt) {
        if (typeof txt == String){
            this._description = txt;
        }
    }
}