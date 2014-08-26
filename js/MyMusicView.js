var MyMusicView = Backbone.View.extend({
  events :{
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.addClass("mymusicview");
    this.$el.html("");

    this.$el.append((new ArtistViewSeparator({model : "PLAYLISTS"})).render().$el);
    this.model.forEach(function(pl){
      if(!pl.playlists){
        this.$el.append((new PlaylistCard({model: pl, ws: this.options.ws})).render().$el);
      }
    }.bind(this));
    return this;
  }
});
