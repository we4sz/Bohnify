var ArtistTopView = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      var self =this;
      _.each(this.model.get("tracks").toArray(), function(track, i) {
          self.$el.append((new TrackView({model: track, ws : self.options.ws})).render().$el);
      });
      return this;
  },show : function(_,notChange){

  }
});
