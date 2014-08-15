var HistoryMobileView = Backbone.View.extend({
  events :{
    'update' : 'update',
    'newhistory' : 'newhistory'
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("historyview");
      this.$el.append((new TracksMobileView({model: this.model, ws : this.options.ws,  extraclass: "historytrack"})).render().$el);
      return this;
  }, update : function(){
    this.options.ws.send({gethistory : true});
  }, newhistory : function(_,history){
    this.model = history;
    var scroll = this.$el.scrollTop();
    this.render();
    this.$el.scrollTop(scroll);
  }
});
