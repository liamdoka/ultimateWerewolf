"use strict";

client.on("startGame", lobby => {
    gameInit(lobby);
})

function gameInit(lobby) {

    cardlist.innerHTML = '';
    for (let i = 0; i < deck.length; i++) {
        //const card = deck[i];

        if (lobby.active_deck.includes(i)) { 

            cardlist.innerHTML += `                                
            <li class="card" id="` + i + `">
                <div class="card__container">
                    <img src="img/back.png" alt="Card Back" class="card__image">
                    <div class="card__name">[redacted]</div>
                </div>
            </li>`; 

        } else {
            cardlist.innerHTML += `                                
            <li class="placeholder-card"></li>`; 
        }
    }
}