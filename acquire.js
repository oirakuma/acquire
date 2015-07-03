var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["red","yellow","orange","green","blue","purple","cyan"];

//model
var chainMarkers = {};

function Player(uid) {
  this.cash = 6000;
  this.stocks = {};
  this.tiles = [];
  this.uid = uid;
  for (var p in colors)
    this.stocks[colors[p]] = 0;
}

function deleteFromArray(a, x) {
  for (var i = 0; i < a.length; i++)
    if (a[i] == x)
      a.splice(i, 1);
}

function merge(h, h2) {
  for (var p in h2)
    h[p] = h2[p];
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
      this.players[i] = new Player(i);
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
  
  getStockholders: function(color) {
    var values = this.players.map(function(u){
      return u.stocks[color];
    });

    var maxValue = Math.max.apply(null, values);
    var h = {};
    if (maxValue > 0) {
      h["majors"] = this.players.filter(function(u){
        return u.stocks[color] == maxValue;
      }).map(function(u){
        return u.uid;
      });
    }

    deleteFromArray(values, maxValue);
    var secondValue = Math.max.apply(null, values);
    if (secondValue > 0) {
      h["minors"] = this.players.filter(function(u){
        return u.stocks[color] == secondValue;
      }).map(function(u){
        return u.uid;
      });
    }
    return h;
  },

  getShares: function(color) {
    var price = this.price(color);
    return this.getShares2("majors", color, 15*price, 10*price);
  },

  getShares2: function(type, color, amount1, amount2) {
    var a = this.getStockholders(color)[type];
    var h = {};
    if (!a || a.length == 0) {
      null; 
    } else if (a.length >= 2) {
      a.map(function(id){
        h[id] = amount1/a.length
      });
    } else {
      var id = a[0];
      h[id] = amount2;
      if (type == "majors") {
        var h2 = this.getShares2("minors", color, amount2/2, amount2/2);
        merge(h, h2);
      }
    }
    return h;
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
