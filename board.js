(function(global){
  global.Board = Board;

//  var gray = 'rgb(128, 128, 128)';
  var gray = 'gray';
  var lightgray = 'rgb(211, 211, 211)';

  function Board() {
    //ex) tiles["3G"] = "red"
    this.tiles = {};
  }

  Board.prototype.getColor = function(name) {
    if (!name) return lightgray;
    return this.tiles[name];
  }

  Board.prototype.putTile = function(name) {
    this.tiles[name] = "gray";
  }

  //隣接するホテルの色も変更する
  Board.prototype.setColor = function(name, color) {
    if (this.getColor(name) == gray) {
      this.tiles[name] = color;
      this.setColor(this.getName(name,  1, 0), color);
      this.setColor(this.getName(name, -1, 0), color);
      this.setColor(this.getName(name, 0,  1), color);
      this.setColor(this.getName(name, 0, -1), color);
    }
  }

  function indexOfChar(c) {
    for (var i = 0; i < chars.length; i++)
      if (chars[i] == c)
        return i;
    return -1;
  }
  
  Board.prototype.getName = function(name, vx, vy) {
    var n = parseInt(name[0]);
    var c = indexOfChar(name[1]);
    n += vx;
    c += vy;
    if (n < 1 || n > 9 || c < 0 || c >= 12) return null;
    return n+chars[c];
  }
  
  Board.prototype.isHotel = function(name) {
    var color = this.getColor(name);
    return color == gray;
  }

  Board.prototype.isHotelChain = function(name) {
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

  Board.prototype.isHotelMerged = function(name) {
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

  Board.prototype.merge = function() {
    //吸収されるホテルのタイルを吸収するホテルの色に変更する
    this.tiles[this.name] = this.merger;
    for (var p in this.tiles) {
      if (this.tiles[p] == this.merged)
        this.tiles[p] = this.merger;
    }
  }

  Board.prototype.getStockholders = function(color) {
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

  Board.prototype.getHotelChainSize = function(color) {
    var count = 0;
    for (var p in this.tiles) {
      if (this.tiles[p] == color)
        count++;
    }
    return count;
  }
  
  Board.prototype.checkChain = function(name) {
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
})(this.self);