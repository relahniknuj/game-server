const WebSocket = require("ws");
const readline = require("readline");
const screens = require("./screens")

const ws = new WebSocket("ws://192.168.0.104:8080");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let plrId = null;
let username = null;
let admin = null;
let currentScreen

ws.on("open", function () {
    console.clear();
    console.log("Csatlakozva a szerverhez!\n");

    rl.question("Mi a neved? ", function (username) {

        ws.send(JSON.stringify({
            function: "sendName",
            data: {
                username: username
            }
        }));
    });
});

ws.on("message", function (message) {

    const response = JSON.parse(message.toString());

    switch (response.function) {

        case "setupDone":
            plrId = response.data.playerID;
            username = response.data.username;
            admin = response.data.admin;

            if (admin) {
                drawScreen("adminScreen")
            }

            break;

        default:
            console.log("Szerver:", response);
            break;
    }
});

ws.on("close", function () {
    console.log("Kapcsolat lezárva.");
});

ws.on("error", function (error) {
    console.log("WebSocket hiba:", error.message);
});

function drawScreen(screentype) {

    switch (screentype) {
        case "adminScreen":
            screens.adminTab();
    }
}