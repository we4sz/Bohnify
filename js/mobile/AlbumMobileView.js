var AlbumMobileView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("albumview");
      this.$el.append((new TracksMobileView({model: this.model.tracks, ws : this.options.ws,album : false,artist:false})).render().$el);
      return this;
  }
});