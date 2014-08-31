var PlaylistView = Backbone.View.extend({
  events : {
    "updateplaylist" : "update"
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("playlistview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.tracks.length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>The playlist is currently empty</div>"));
      }else{
        this.$el.append((new TracksView({model: this.model.tracks, ws : this.options.ws,  extraclass: "playlisttrack"})).render().$el);
      }
      this.$el.find(".tracksview").trigger("passiveselectfirst");
      return this;
  }, update : function(_,pl){
    if(this.model.uri == pl.uri){
      var index = -1;
      var passive = true;
      var tracks = $(".track");
      tracks.each(function(i){
        if($( this ).hasClass("selected")){
          index = i;
          passive = false;
          return false;
        }else if($( this ).hasClass("passiveselected")){
          index = i;
          return false;
        }
      })

      var scroll = $("#result").scrollTop();
      this.model = pl;
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
    return false;
  }
});
