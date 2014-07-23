var HistoryView = Backbone.View.extend({
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
      this.$el.append((new ArtistViewSeparator({model : "HISTORY"})).render().$el);
      this.$el.append((new TracksView({model: this.model, ws : this.options.ws,  extraclass: "historytrack"})).render().$el);
      return this;
  }, update : function(){
    var index = $(".track.selected").index();
    this.options.selected = {track : this.model.at(index), index : index};
    this.options.ws.send(JSON.stringify({gethistory : true}));
  }, newhistory : function(_,history){
    this.model = history;
    this.render();
    if(this.options.selected){
      for(var i = this.options.selected.index-2 ; i <=  this.options.selected.index +2 && i < $(".track").length;i++){
        $($(".track").get(i)).trigger("selecturi",this.options.selected.track.get("uri"));
      }
      if($(".track.selected").length == 0){
        $("#history").trigger("select");
      }
    }
  }
});
