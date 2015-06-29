var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["red","yellow","orange","green","blue","purple","cyan"];

//model
var chainMarkers = {};

function Player() {
  this.cash = 6000;
  this.stocks = {};
  this.tiles = [];
  for (var p in colors)
    this.stocks[colors[p]] = 0;
}

function createTiles() {
  var ts = [];
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 12; j++)
      ts.push((j+1)+chars[i]);
  }
  return ts;
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

var Acquire = Backbone.Model.extend({
  initialize: function() {
    //tiles
    this.tiles = _.shuffle(_.shuffle(createTiles()));
    //board
    this.board = new Board();
    //players
    this.players = [];
    for (var i = 0; i < 4; i++)
      this.players[i] = new Player();
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < this.players.length; j++)
        this.players[j].tiles.push(this.getTile());
    }
    //chainMarkers
    for (var p in colors)
      chainMarkers[colors[p]] = false;
    //stocks
    this.stocks = {};
    for (var p in colors)
      this.stocks[colors[p]] = 25;
  },

  pushTile: function(id) {
    this.players[id].tiles.push(this.getTile());
  },

  canPut: function(id, name) {
    var result = true;
    this.board.putTile(name);
    if (this.board.isHotelMerged(name)) {
      if (this.board.getHotelChainSize(this.board.merged) >= 11)
        result = false;
    //チェーンマーカーが残っていないときは新規チェーンを形成するタイルは置けない
    } else if (this.board.checkChain(name) && this.countChain() == 7) {
      result = false;
    }
    this.board.removeTile(name);
    return result;
  },

  getTile: function() {
    return this.tiles.shift();
  },

  price: function(color) {
    var size = this.board.getHotelChainSize(color)
    console.log(size);
    if (color == "red" || color == "yellow") {
      if (size == 0) return 0;
      else if (size == 2) return 200;
      else if (size == 3) return 300;
      else if (size == 4) return 400;
      else if (size == 5) return 500;
      else if (size <= 10) return 600;
      else if (size <= 20) return 700;
      else if (size <= 30) return 800;
      else if (size <= 40) return 900;
      else return 1000;
    } else if (color == "orange" || color == "green" || color == "blue") {
      if (size == 0) return 0;
      else if (size == 2) return 300;
      else if (size == 3) return 400;
      else if (size == 4) return 500;
      else if (size == 5) return 600;
      else if (size <= 10) return 700;
      else if (size <= 20) return 800;
      else if (size <= 30) return 900;
      else if (size <= 40) return 1000;
      else return 1100;
    } else if (color == "purple" || color == "cyan") {
      if (size == 0) return 0;
      else if (size == 2) return 400;
      else if (size == 3) return 500;
      else if (size == 4) return 600;
      else if (size == 5) return 700;
      else if (size <= 10) return 800;
      else if (size <= 20) return 900;
      else if (size <= 30) return 1000;
      else if (size <= 40) return 1100;
      else return 1200;
    }
  },
  
  getShare: function(color) {
    return 10*this.price(color);
  },

  getStockholders: function(color) {
    var h = {};
    console.log(color);
    for (var i = 0; i < this.players.length; i++) {
      console.log(this.players[i].stocks);
      var x = this.players[i].stocks[color];
      if (x > 0)
        h[i] = x;
    }
    console.log(h);
    return sortHashByValue(h);
  },

  shareToStockholders: function() {
    //株主への配当
    var major = this.getShare(this.board.merged);
    var minor = major/2;

    var a = this.getStockholders(this.board.merged);
    console.log("stockholders", a);

    var self = this;
    function share(id, value) {
      self.players[id].cash += value;
      logView.append(id, 'was shared '+value+'.');
    }
 
    if (a.length == 0) {
      ;
    } else if (a.length == 1) {
      this.players[a[0][0]].cash += major;
    } else {
      //筆頭株主が2人
      if (a[0][1] == a[1][1]) {
        share(a[0][0], (major+minor)/2);
        share(a[1][0], (major+minor)/2);
      } else {
        //第２株主が2人
        if (a.length >= 3 && a[1][1] == a[2][1]) {
          share(a[0][0], major);
          share(a[1][0], minor/2);
          share(a[2][0], minor/2);
        //通常
        } else {
          share(a[0][0], major);
          share(a[1][0], minor);
        }
      }
    }

    setTimeout(function(){
      stockTableView.render();
    }, 0);
  },

  merge: function() {
    //チェーンマーカーを返す。
    chainMarkers[this.board.merged] = false;
    //タイルの色を更新する
    this.board.merge();
    setTimeout(function(){
      tilesView.render();
    }, 0);
  },

  countChain: function() {
    var count = 0;
    this.eachChain(function(){
      count++;
    });
    return count;
  },

  //ホテルチェーンになっているカラーに対して
  eachChain: function(callback) {
    for (var p in chainMarkers) {
      if (chainMarkers[p])
        callback(p);
    }
    return false;
  },
  
  //ホテルチェーンになっていないカラー対して
  eachChainMarker: function(callback) {
    for (var p in chainMarkers) {
      if (!chainMarkers[p])
        callback(p);
    }
    return false;
  },
  
  chained: function() {
    for (var p in chainMarkers) {
      if (chainMarkers[p])
        return true;
    }
    return false;
  },

  purchaseStock: function(id, color) {
    this.players[id].stocks[color] += 1;
    this.players[id].cash -= this.price(color);
    this.stocks[color] -= 1;

    logView.append(id, "purchased "+color+".");
  },

  buildChain: function(id, name, color) {
    this.board.setColor(name, color);
    chainMarkers[color] = true;
    this.players[id].stocks[color] += 1;
    this.stocks[color] -= 1;

    logView.append(id, 'has created '+color+' on '+name+'.');
  },

  sell: function(x) {
    this.players[x].stocks[this.board.merged]--;
    this.players[x].cash += this.price(this.board.merged);
    this.stocks[this.board.merged]++;
  },

  trade: function(x) {
    this.players[x].stocks[this.board.merged] -= 2;
    this.players[x].stocks[this.board.merger] += 1;
    this.stocks[this.board.merged] += 2;
    this.stocks[this.board.merger] -= 1;
  },

  sellAll: function() {
    for (var i = 0; i < this.players.length; i++) {
      for (var p in this.players[i].stocks) {
        this.players[i].cash += this.players[i].stocks[p]*this.price(p);
        this.players[i].stocks[p] = 0;
      }
    }
  },

  isGameEnd: function() {
    //41を越えるホテルチェーンができていればゲーム終了
    var self = this;
    var b = false;
    this.eachChain(function(color){
      if (self.board.getHotelChainSize(color) >= 41)
        b = true;
    });
    if (b) return true;
    //すべてのホテルチェーンが11以上ならゲーム終了
    for (var p in colors) {
      if (self.board.getHotelChainSize(colors[p]) < 11)
        return false;
    }
    return true;
  }
});

var stockTableView = null;
var purchaseView = null;
var tilesView = null;
var logView = new LogView({el:"#log"});
$(document).ready(function(){
  var acquire = new Acquire();
  stockTableView = new StockTableView({model:acquire});
  stockTableView.render();
  tilesView = new TilesView({model:acquire,id: "#tiles"});
  tilesView.render();
  tilesView.start();
});
