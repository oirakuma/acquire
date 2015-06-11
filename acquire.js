var tiles = null;
var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["purple","red","blue","yellow","cyan","green","orange"];
var chainMarkers = null;
var players = null;

function indexOfChar(c) {
  for (var i = 0; i < chars.length; i++)
    if (chars[i] == c)
      return i;
  return -1;
}

function createArea(n, c) {
  return '<td class="'+n+c+'">'+n+c+'</td>';
}

function createTile(label) {
  var a = $('<a href="#" data-role="button" data-inline="true">'+label+'</a>');
  a.click(function(){
    var label = $(this).text();
    var dst = $(".content ."+label);
    dst.css("background-color", "gray");
    checkChain(label);
    $(this).text(tiles.shift());
  });
  return a;
}

function getColor(name) {
  if (!name) return 'rgb(0, 0, 0)';
  return $(".content ."+name).css("background-color");
}

function setColor(name, color) {
  return $(".content ."+name).css("background-color", color);
}

function Player() {
  this.cash = 6000;
  this.stocks = {};
  for (var p in colors)
    this.stocks[colors[p]] = 0;
}

function initialize() {
  tiles = [];
  var table = $("<table></table>");
  for (var i = 0; i < 12; i++) {
    var tr = $("<tr></tr>");
    for (var j = 0; j < 9; j++) {
      tr.append(createArea(j+1, chars[i]));
      tiles.push((j+1)+chars[i]);
    }
    table.append(tr);
  }
  $(".content").append(table);
  tiles.sort(function(){
    return Math.random()-0.5;
  });
  tiles.sort(function(){
    return Math.random()-0.5;
  });
 
  $(".ui .tile").click(function(){
    var label = $(this).text();
    var dst = $(".content ."+label);
    dst.css("background-color", "gray");
    checkChain(label);
    $(this).text(tiles.shift());
  });

  $(".ui .tile").map(function(){
    $(this).text(tiles.shift());
  });

  chainMarkers = [];
  for (var p in colors)
    chainMarkers.push(colors[p]);

  //player
  players = [];
  for (var i = 0; i < 4; i++)
    players[i] = new Player();

  var table = $("<table></table>");
  var tr = $("<tr></tr>");
  for (var p in colors)
    tr.append('<th>'+colors[p]+'</th>');
  table.append(tr);
  for (var i = 0; i < 4; i++) {
    tr = $("<tr></tr>");
    for (var p in colors) {
      var x = players[i].stocks[colors[p]];
      tr.append('<td align="right">'+x+'</td>');
    }
    table.append(tr);
  }
  $("#stocks .ui-content").append(table);
}

function getName(name, vx, vy) {
  var n = parseInt(name[0]);
  var c = indexOfChar(name[1]);
  n += vx;
  c += vy;
  if (n < 1 || n > 9 || c < 0 || c >= 12) return null;
  return n+chars[c];
}

function isHotel(name) {
  var color = getColor(name);
  console.log(color);
  return color == 'rgb(128, 128, 128)';
}

function isHotelChain(name) {
  var color = getColor(name);
  if (color != 'rgb(0, 0, 0)' && color != 'rgb(128, 128, 128)')
    return color;
  return false;
}

function isHotelMerged(name) {
}

function removeChainMarker(color) {
  for (var i = 0; i < chainMarkers.length; i++) {
    if (chainMarkers[i] == color) {
      chainMarkers.splice(i, 1);
      return;
    }
  }
}

function selectHotelChain(callback) {
  var header = '<div data-role="header"><h2>Select the hotel chain</h2></div>';
  var popup = '<div data-role="popup" class="popup" data-theme="none"></div>';
  var body = $('<div></div>');
  for (var p in chainMarkers) {
    var a = $('<a href="#one" class="ui-btn"></a>').text(colors[p]);
    a.css("background-color", colors[p]);
    a.click(function(){
      var color = $(this).text();
      removeChainMarker(color);
      setTimeout(function(){
        callback(color);
      }, 500);
    });
    body.append(a);
  }
  setTimeout(function(){
    $(popup).append(header).append(body).popup().popup("open");
  }, 500);
}

function checkChain(name) {
  var color1 = getColor(name);
  var color2 = null;
  var vx = [1, -1, 0,  0];
  var vy = [0,  0, 1, -1];

  for (var i = 0; i < vx.length; i++) {
    if (color2 = isHotelChain(getName(name, vx[i], vy[i]))) {
      setColor(name, color2);
    } else if (isHotel(getName(name, vx[i], vy[i]))) {
      (function(i){
        selectHotelChain(function(color){
          setColor(name, color);
          setColor(getName(name, vx[i], vy[i]), color);
        });
      })(i);
    }
  }
}

function reset() {
  initialize();
}

$(document).ready(function(){
  initialize();
  $(document).page();
});

setTimeout(function(){
}, 2000);
