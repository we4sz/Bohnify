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
      this.$el.find(".tracksview").trigger("passiveselectfirst");
      return this;
  }, update : function(){
    this.options.ws.send({gethistory : true});
  }, newhistory : function(_,history){
    var index = -1;
    var passive = false;
    var tracks = $(".track");
    tracks.each(function(i){
      if($( this ).hasClass("selected")){
        index = i;
        return false;
      }else if($( this ).hasClass("passiveselected")){
        index = i;
        passive = true;
        return false;
      }
    })

    var scroll = $("#result").scrollTop();
    this.model = history;
    this.render();
    tracks = $(".track");
    if(index >= 0){
      if(tracks.length > index){
        $(tracks.get(index)).trigger(passive ? "passiveselect" : "select");
      }else if(tracks.length > 0){
        $(tracks.get(tracks.length -1)).trigger(passive ? "passiveselect" : "select");
      }else{
        $(".playlistitem.passiveselected").trigger("makeselect");
      }
    }else if(tracks.length > 0){
      $(tracks.get(0)).trigger(passive ? "passiveselect" : "select");
    }
    $("#result").scrollTop(scroll);
  }
});
