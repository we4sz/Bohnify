var ArtistAlbumView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("albumview");
      this.$el.append((new ArtistAlbumHeader({model : this.model, ws:this.options.ws})).render().$el);
      this.$el.append((new TracksView({model: this.model.tracks,max:3, ws : this.options.ws,album : false,artist:false})).render().$el);
      return this;
  }
});
