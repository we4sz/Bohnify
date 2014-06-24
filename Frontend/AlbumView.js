var AlbumView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("albumview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      this.$el.append((new TracksView({model: this.model.get("tracks"), ws : this.options.ws,album : false,artist:false})).render().$el);
      return this;
  }
});
