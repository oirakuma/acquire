var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["purple","red","blue","yellow","cyan","green","orange"];
//var gray = 'rgb(128, 128, 128)';
var gray = 'gray';
var lightgray = 'rgb(211, 211, 211)';
var orange = 'rgb(255, 165, 0)';

//model
(function(global){
  global.Acquire = Acquire;

  var chainMarkers = {};

  function Acquire() {
    //tiles
    this.tiles = shuffle(shuffle(createTiles()));
    //players
    this.players = [];
    for (var i = 0; i < 4; i++)
      this.players[i] = new Player();
    for (var i = 0; i < this.players.length; i++) {
      for (var j = 0; j < 6; j++)
        this.players[i].tiles.push(this.tiles.shift());
    }
    for (var p in colors)
      chainMarkers[colors[p]] = false;
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

  Acquire.prototype.price = function(color) {
    var size = this.getHotelChainSize(color)
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
  
  Acquire.prototype.getColor = function(name) {
    if (!name) return lightgray;
    var style = $("#tiles ."+name).attr("style");
    if (style) {
      var h = parseStyle(style);
      return h["background-color"];
    }
    return null;
  }
  
  //隣接するホテルの色も変更する
  Acquire.prototype.setColor = function(name, color) {
    if (this.getColor(name) == gray) {
      $("#tiles ."+name).css("background-color", color);
      this.setColor(this.getName(name,  1, 0), color);
      this.setColor(this.getName(name, -1, 0), color);
      this.setColor(this.getName(name, 0,  1), color);
      this.setColor(this.getName(name, 0, -1), color);
    }
  }

  Acquire.prototype.putTile = function(name) {
    var div = $("#tiles ."+name);
    div.css("background-color", "gray");
    div.css("border", "1px outset gray");
    div.text("");
  }

  function indexOfChar(c) {
    for (var i = 0; i < chars.length; i++)
      if (chars[i] == c)
        return i;
    return -1;
  }
  
  Acquire.prototype.getName = function(name, vx, vy) {
    var n = parseInt(name[0]);
    var c = indexOfChar(name[1]);
    n += vx;
    c += vy;
    if (n < 1 || n > 9 || c < 0 || c >= 12) return null;
    return n+chars[c];
  }
  
  Acquire.prototype.isHotel = function(name) {
    var color = this.getColor(name);
    return color == gray;
  }

  Acquire.prototype.isHotelChain = function(name) {
    var color = this.getColor(name);
    if (color == lightgray || color == gray) return false;
    return color;
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

  Acquire.prototype.isHotelMerged = function(name) {
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];

    var colors = {};
    var color;
    //4方向のホテルチェーンの色を数える。
    for (var i = 0; i < vx.length; i++) {
      if (color = this.isHotelChain(this.getName(name, vx[i], vy[i])))
        colors[color] = 0;
    }
    var count = 0;
    for (var p in colors)
      count += 1;
    if (count >= 2) {
      for (var p in colors)
        colors[p] = this.getHotelChainSize(p);
      var a = sortHashByValue(colors);
      //[["yellow", 7], ["red", 5], ["blue", 3]]
      console.log(a);
      this.name = name;
      this.merger = a[0][0];
      this.merged = a[1][0];
    }
    return count >= 2;
  }

  Acquire.prototype.merge = function() {
    var self = this;
    //吸収されるホテルのタイルを吸収するホテルの色に変更する
    $("#tiles td").map(function(){
      var style = $(this).attr("style");
      if (style) {
        var h = parseStyle(style);
        if (h["background-color"] == self.merged)
          $(this).css("background-color", self.merger);
      }
    });
    //さっき置いたタイルの色を変更する。
    $("#tiles ."+self.name).css("background-color", self.merger);
    //チェーンマーカーを返す。
    chainMarkers[self.merged] = false;
  }

  Acquire.prototype.takeChainMarker = function(color) {
    chainMarkers[color] = true;
  }

  Acquire.prototype.eachChain = function(callback) {
    for (var p in chainMarkers) {
      if (chainMarkers[p])
        callback(p);
    }
    return false;
  }
  
  Acquire.prototype.eachChainMarker = function(callback) {
    for (var p in chainMarkers) {
      if (!chainMarkers[p])
        callback(p);
    }
    return false;
  }
  
  Acquire.prototype.checkChain = function(name) {
    var self = this;
    var color1 = this.getColor(name);
    var color2 = null;
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];
  }

    function parseStyle(style) {
      var ss = style.split(";");
      var h = {};
      for (var i = 0; i < ss.length-1; i++) {
        var xx = ss[i].split(":");
        h[xx[0].trim()] = xx[1].trim();
      }
      return h;
    }
    
  Acquire.prototype.getHotelChainSize = function(color) {
    var tiles = $("#tiles td");
    var a = tiles.filter(function(){
      var style = $(this).attr("style");
      if (style) {
        var h = parseStyle(style);
        if (h["background-color"] == color)
          return true;
      }
      return false;
    });
    return a.length;
  }
  
  Acquire.prototype.checkChain = function(name) {
    var self = this;
    var color1 = this.getColor(name);
    var color2 = null;
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];
  
    //4方向にホテルかホテルチェーンがあるかどうか調べる
    //ホテルチェーンがあった場合は吸収される（合併でないことは保証されている）
    for (var i = 0; i < vx.length; i++) {
      var name2 = self.getName(name, vx[i], vy[i]);
      if (color2 = self.isHotelChain(name2)) {
        self.setColor(name, color2);
      } else if (self.isHotel(name2)) {
        console.log("isHotel");
        return true;
      }
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
  }

  Acquire.prototype.buildChain = function(name, color) {
    this.setColor(name, color);
    chainMarkers[color] = true;
    this.players[0].stocks[color] += 1;
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
var ai = null;
var logView = new LogView("#log");
$(document).ready(function(){
  var acquire = new Acquire();
  ai = new ComputerAI(acquire);
  stockTableView = new StockTableView({model:acquire,id:"#stocks"});
  stockTableView.render();
  var tilesView = new TilesView({model:acquire,id: "#tiles"});
  tilesView.render();
  purchaseView = new PurchaseView({model:acquire, el:"#purchase"});
  render(acquire, ai);
});
