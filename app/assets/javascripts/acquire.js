var colors = ["red","yellow","orange","green","blue","purple","cyan"];
var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];

//model
(function(global){
  global.Acquire = Acquire;

  var chainMarkers = {};

  function Acquire(game) {
    this.tiles = JSON.parse(game.tiles);
    this.players = game.users.map(function(u){
      return new Player(u);
    });
    chainMarkers = JSON.parse(game.chain_markers);
  }

  function createTiles() {
    var ts = [];
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 12; j++)
        ts.push((j+1)+chars[i]);
    }
    return ts;
  }
 
  function shuffle(a) {
    return a.sort(function(){
      return Math.random()-0.5;
    });
  }

  Acquire.prototype.pushTile = function(id) {
//    this.players[id].tiles.push(this.getTile());
  }

  Acquire.prototype.getTile = function() {
    return this.tiles.shift();
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
      var x = this.players[i].stocks[color];
      if (x > 0)
        h[i] = x;
    }
    console.log(h);
    return sortHashByValue(h);
  }

  Acquire.prototype.shareToStockholders = function() {
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
  }

  Acquire.prototype.merge = function() {
    //チェーンマーカーを返す。
    chainMarkers[this.board.merged] = false;
    //タイルの色を更新する
    this.board.merge();
    setTimeout(function(){
      tilesView.render();
    }, 0);
  }

  Acquire.prototype.countChain = function() {
    var count = 0;
    this.eachChain(function(){
      count++;
    });
    return count;
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

  Acquire.prototype.purchaseStock = function(id, color) {
    this.players[id].stocks[color] += 1;
    this.players[id].cash -= this.price(color);
    this.stocks[color] -= 1;

    logView.append(id, "purchased "+color+".");
  }

  Acquire.prototype.buildChain = function(id, name, color) {
    this.board.setColor(name, color);
    chainMarkers[color] = true;
    this.players[id].stocks[color] += 1;
    this.stocks[color] -= 1;

    logView.append(id, 'has created '+color+' on '+name+'.');
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

  Acquire.prototype.sellAll = function() {
    for (var i = 0; i < this.players.length; i++) {
      for (var p in this.players[i].stocks) {
        this.players[i].cash += this.players[i].stocks[p]*this.price(p);
        this.players[i].stocks[p] = 0;
      }
    }
  }

  Acquire.prototype.isGameEnd = function() {
    //41を越えるホテルチェーンができていればゲーム終了
/*    var self = this;
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
    return true;*/
    return false;
  }

  function Player(user) {
    for (var p in user)
      this[p] = user[p];
    if (this.tiles)
      this.tiles = JSON.parse(this.tiles);
    this.stocks = JSON.parse(this.stocks);
  }
})(this.self);

function start(game) {
  var acquire = new Acquire(game);
  stockTableView = new StockTableView({model:acquire,id:"#stocks"});
  stockTableView.render();
  tilesView = new TilesView({model:acquire,id: "#tiles"});
  tilesView.render();
  tilesView.start();

/*  setInterval(function(){
    $.ajax({
      url: "/games/1.json",
      success: function(game) {
        stockTableView.render();
        tilesView.render(game);
      }
    });
  }, 2000);*/
}

var stockTableView = null;
var purchaseView = null;
var tilesView = null;
var logView = new LogView({el:"#log"});
var userId = null;
var game = null;

function checkGameUsers() {
  $.ajax({
    url: "/games/1.json",
    success: function(game) {
      window.game = game;
      start(game);
    }
  });
}

checkGameUsers();
