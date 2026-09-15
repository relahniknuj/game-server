const WebSocket = require("ws");

const wss = new WebSocket.Server({
    port: 8080
});

const Players = new Map();
let plrId = 1

let Game = new Map();

let connectedPlrs = [];
let gamemode = "blackjack";
let plrTurn;

let blackjackDeck = ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC"];

console.log("WebSocket szerver fut a 8080-as porton");

wss.on("connection", function connection(ws) {

    //ws.send("Hello a szervertől!");

    ws.on("message", function incoming(message) {
        let request;

        request = JSON.parse(message.toString());

        switch (request.function) {
            case "sendName":
                setupPlayer(request.data.username, ws)
                break;
            case "startGame":
                const adminUser = Players.get(1);

                if (!adminUser) return;

                if (adminUser.ws === ws) {
                    console.log("OKÉ")
                    startGame(ws)
                } else {
                    console.log("Csak adminok tujdák ezt :P")
                }
        }
    });

    ws.on("close", function () {
        let leftPlrName;
        
        console.log("Kliens lecsatlakozott");
        
        for (const [id, player] of Players) {
            if (player.ws === ws) {
                leftPlrName = player.username;
                break;
            }

            const index = connectedPlrs.indexOf(leftPlrName);

            if (index !== -1) {
                connectedPlrs.splice(index, 1);
            }
        }
    });
});

function setupPlayer(username, ws) {
    const admin = username === "tanczos";

    if (username === "tanczos") {
        Players.set(1, {username: username, ws: ws, admin: admin, deck: {}})
        console.log(Players);
        connectedPlrs.push(username);
        sendBackToPlayer(ws, { function: "setupDone", data: {playerID: 1, username: username, admin: admin}});
        return;
    } else {
        plrId++
    }


    Players.set(plrId, {username: username, ws: ws, admin: admin, deck: {}});
    connectedPlrs.push(username);
    console.log(Players);

    sendBackToPlayer(ws, { function: "setupDone", data: {playerID: plrId, username: username, admin: admin}});
    console.log("elküldve!")
}

function sendBackToPlayer(ws, data) {
    ws.send(JSON.stringify(data));
}

function sendToAllPlayers(func ,data) {
    const message = {function: func, data: data};
    for (const [id, player] of Players) {

        if (id === 999) {return}

        player.ws.send(JSON.stringify(message));
    }
}

function startGame(ws) {

    if (connectedPlrs.length >= 2) {
        Game.set(1, {gm: gamemode, players: connectedPlrs});

        setupBlackJack();
    } else {
        sendBackToPlayer(ws, {function: "notEnoughPlrs"});
    }
}

//blackjackj
function setupBlackJack() {

    let plrsAndDeck;

    Players.set(999, {username: "dealer", ws: {}, deck: {}});

    function giveCards(plr) {
        let generatedNumber = Math.floor(Math.random() * blackjackDeck.length);
        const card = blackjackDeck.splice(generatedNumber, 1)[0];

        generatedNumber = Math.floor(Math.random() * blackjackDeck.length);
        const card2 = blackjackDeck.splice(generatedNumber, 1)[0];

        plr.deck = {card, card2};
    }

    for (const [id, player] of Players) {
        giveCards(player);

        plrsAndDeck = [...Players.values()].map(player => ({username: player.username, deck: player.deck}))
    }

    sendToAllPlayers("gameReady", {plrsAndDeck, gm: gamemode, plrs: connectedPlrs});
}

function deckChanged() {

}