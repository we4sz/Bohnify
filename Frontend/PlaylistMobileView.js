var PlaylistMobileView = Backbone.View.extend({
  events : {
    "update" : "update"
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("playlistview");
    //  this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.tracks.length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>The playlist is currently empty</div>"));
      }else{
        this.$el.append((new TracksMobileView({model: this.model.tracks, ws : this.options.ws,  extraclass: "playlisttrack"})).render().$el);
      }
      return this;
  }, update : function(_,pl){
    if(this.model.uri == pl.uri){
      var scroll = $("#result").scrollTop();
      this.model = pl;
      this.render();
      $("#header").trigger("settext",pl.name);
      $("#result").scrollTop(scroll);
    }
  }
});
