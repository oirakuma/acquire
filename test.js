var acquire = new Acquire();
acquire.board.tiles["1A"] = "red";
acquire.board.tiles["2A"] = "red";
acquire.board.tiles["3A"] = "red";

acquire.players[0].stocks["red"] = 4;
acquire.players[1].stocks["red"] = 3;
var shares = acquire.getStockholders("red");
console.log("stockholders", shares);

var shares = acquire.getShares("red");
console.log("shares", shares);
