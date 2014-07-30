var PlaylistView = Backbone.View.extend({
  events : {
    "update" : "update",
    "newplaylist" : "newplaylist"
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("playlistview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.get("tracks").length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>The playlist is currently empty</div>"));
      }else{
        this.$el.append((new TracksView({model: this.model.get("tracks"), ws : this.options.ws,  extraclass: "playlisttrack"})).render().$el);
      }
      this.$el.find(".tracksview").trigger("passiveselectfirst");
      return this;
  }, update : function(_,uri){
    if(this.model.get("uri") == uri){
      this.options.selected = $(".track.selected").index();
      this.options.passive = $(".track.passiveselected").index();
      this.options.ws.send({search : this.model.get("uri")}, true);
    }
  },newplaylist: function(_,pl){
    this.model = pl;
    this.render();

    if(this.options.selected >= 0 && this.options.selected < this.model.get("tracks").length){
      $(this.$el.find(".track").get(this.options.selected)).trigger("select");
    }else if(this.options.passive >= 0 && this.options.passive < this.model.get("tracks").length){
      $(this.$el.find(".track").get(this.options.passive)).trigger("passiveselect");
    }else{
      this.$el.find(".tracksview").trigger("passiveselectfirst");
    }
  }
});
