var HistoryView = Backbone.View.extend({
  events :{
    'update' : 'update'
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("historyview");
      this.$el.append((new ArtistViewSeparator({model : "HISTORY"})).render().$el);
      this.$el.append((new TracksView({model: this.model, ws : this.options.ws,  extraclass: "historytrack"})).render().$el);
      return this;
  }, update : function(){
    $("#result").trigger("update",{type: "load"});
    this.options.ws.send(JSON.stringify({gethistory : true}));
  }
});
