function LogView(option) {
  for (var p in option)
    this[p] = option[p];
}

LogView.prototype.append = function(s) {
  $(this.el).append('<div>'+s+'</div>');
  $(this.el).scrollTop(99999);
}
