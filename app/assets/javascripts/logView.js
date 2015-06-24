function LogView(option) {
  for (var p in option)
    this[p] = option[p];
}

LogView.prototype.append = function(id, msg) {
  var player = (id == 0 ? 'You' : 'Computer('+id+')');
  $(this.el).append('<div>'+player+' '+msg+'</div>');
  $(this.el).scrollTop(99999); //スクロールバーを最下行に持っていく
}

LogView.prototype.info = function(msg) {
  $(this.el).append('<div>'+msg+'</div>');
  $(this.el).scrollTop(99999); //スクロールバーを最下行に持っていく
}
