var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["red","yellow","orange","green","blue","purple","cyan"];

//model
(function(global){
  global.Acquire = Acquire;

  var chainMarkers = {};

  function Acquire() {
    //tiles
    this.tiles = shuffle(shuffle(createTiles()));
    //board
    this.board = new Board();
    //players
    this.players = [];
    for (var i = 0; i < 4; i++)
      this.players[i] = new Player();
    for (var i = 0; i < this.players.length; i++) {
      for (var j = 0; j < 6; j++)
        this.players[i].tiles.push(this.getTile());
    }
    //chainMarkers
    for (var p in colors)
      chainMarkers[colors[p]] = false;
    //stocks
    this.stocks = {};
    for (var p in colors)
      this.stocks[colors[p]] = 25;
  }

  function createTiles() {
    var ts = [];
    for (var i = 0; i < 12; i++) {
      for (var j = 0; j < 9; j++)
        ts.push((j+1)+chars[i]);
    }
    return ts;
  }
 
  function shuffle(a) {
    return a.sort(function(){
      return Math.random()-0.5;
    });
  }

  Acquire.prototype.getTile = function() {
    return this.tiles.shift();
  }

  Acquire.prototype.price = function(color) {
    var size = this.board.getHotelChainSize(color)
    console.log(size);
    if (color == "red" || color == "yellow") {
      if (size == 2) return 200;
      else if (size == 3) return 300;
      else if (size == 4) return 400;
      else if (size == 5) return 500;
      else if (size <= 10) return 600;
      else if (size <= 20) return 700;
      else if (size <= 30) return 800;
      else if (size <= 40) return 900;
      else return 1000;
    } else if (color == "orange" || color == "green" || color == "blue") {
      if (size == 2) return 300;
      else if (size == 3) return 400;
      else if (size == 4) return 500;
      else if (size == 5) return 600;
      else if (size <= 10) return 700;
      else if (size <= 20) return 800;
      else if (size <= 30) return 900;
      else if (size <= 40) return 1000;
      else return 1100;
    } else if (color == "purple" || color == "cyan") {
      if (size == 2) return 400;
      else if (size == 3) return 500;
      else if (size == 4) return 600;
      else if (size == 5) return 700;
      else if (size <= 10) return 800;
      else if (size <= 20) return 900;
      else if (size <= 30) return 1000;
      else if (size <= 40) return 1100;
      else return 1200;
    }
  }
  
  Acquire.prototype.getShare = function(color) {
    return 10*this.price(color);
  }

  function sortHashByValue(h) {
    var a = [];
    for (var p in h)
      a.push([p, h[p]]);
    return a.sort(function(x, y){
      if (x[1] < y[1]) return 1;
      return -1;
    });
  }

  Acquire.prototype.getStockholders = function(color) {
    var h = {};
    console.log(color);
    for (var i = 0; i < this.players.length; i++) {
      console.log(this.players[i].stocks);
      h[i] = this.players[i].stocks[color];
    }
    console.log(h);
    return sortHashByValue(h).map(function(x){
      return x[0];
    });
  }

  Acquire.prototype.merge = function() {
    this.board.merge();
    //チェーンマーカーを返す。
    chainMarkers[this.board.merged] = false;
    //株主への配当
    var stockholders = this.getStockholders(this.board.merged);
    console.log("stockholders", stockholders);
    this.players[stockholders[0]].cash += this.getShare(this.board.merged);
    this.players[stockholders[1]].cash += this.getShare(this.board.merged)/2;
    stockTableView.render();
    tilesView.render();
  }

  Acquire.prototype.takeChainMarker = function(color) {
    chainMarkers[color] = true;
  }

  //ホテルチェーンになっているカラーに対して
  Acquire.prototype.eachChain = function(callback) {
    for (var p in chainMarkers) {
      if (chainMarkers[p])
        callback(p);
    }
    return false;
  }
  
  //ホテルチェーンになっていないカラー対して
  Acquire.prototype.eachChainMarker = function(callback) {
    for (var p in chainMarkers) {
      if (!chainMarkers[p])
        callback(p);
    }
    return false;
  }
  
  Acquire.prototype.chained = function() {
    for (var p in chainMarkers) {
      if (chainMarkers[p])
        return true;
    }
    return false;
  }

  Acquire.prototype.purchaseStock = function(x, color) {
    this.players[x].stocks[color] += 1;
    this.players[x].cash -= this.price(color);
    this.stocks[color] -= 1;
  }

  Acquire.prototype.buildChain = function(name, color) {
    this.board.setColor(name, color);
    chainMarkers[color] = true;
    this.players[0].stocks[color] += 1;
    this.stocks[color] -= 1;
  }

  Acquire.prototype.sell = function(x) {
    this.players[x].stocks[this.board.merged]--;
    this.players[x].cash += this.price(this.board.merged);
    this.stocks[this.board.merged]++;
  }

  Acquire.prototype.trade = function(x) {
    this.players[x].stocks[this.board.merged] -= 2;
    this.players[x].stocks[this.board.merger] += 1;
    this.stocks[this.board.merged] += 2;
    this.stocks[this.board.merger] -= 1;
  }

  function Player() {
    this.cash = 6000;
    this.stocks = {};
    this.tiles = [];
    for (var p in colors)
      this.stocks[colors[p]] = 0;
  }
})(this.self);

var stockTableView = null;
var purchaseView = null;
var tilesView = null;
var ai = null;
var logView = new LogView({el:"#log"});
$(document).ready(function(){
  var acquire = new Acquire();
  ai = new ComputerAI(acquire);
  stockTableView = new StockTableView({model:acquire,id:"#stocks"});
  stockTableView.render();
  tilesView = new TilesView({model:acquire,id: "#tiles"});
  tilesView.render();
  purchaseView = new PurchaseView({model:acquire, el:"#purchase"});
  render(acquire, ai);
});
