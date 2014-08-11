var ArtistAlbumView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
    this.options.max = this.options.max || 3; 
  },
  render : function(){
      this.$el.addClass("albumview");
      this.$el.append((new ArtistAlbumHeader({model : this.model, ws:this.options.ws})).render().$el);
      this.$el.append((new TracksView({model: this.model.get("tracks"),max:this.options.max, ws : this.options.ws,album : false,artist:false})).render().$el);
      return this;
  }
});
