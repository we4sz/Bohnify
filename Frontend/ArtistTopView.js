var ArtistTopView = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("artisttop");
      var left = $.parseHTML("<div class='artisttoptracks'></div>");
      var right = $.parseHTML("<div class='artistsimilar'></div>");
      $(left).append((new ArtistViewSeparator({model : "POPULAR"})).render().$el);
      var self = this;
      _.each(this.model.get("toptracks").toArray(), function(track, i) {
        if(i<5){
          $(left).append((new TrackView({model: track, ws : self.options.ws})).render().$el);
        }
      })

      $(right).append((new ArtistViewSeparator({model : "RELATED ARTISTS"})).render().$el);
      _.each(this.model.get("similar").toArray(), function(artist, i) {
          if(i<4){
            $(right).append((new ArtistSimilarItem({model: artist, ws : self.options.ws})).render().$el);
          }
      });
      this.$el.append(left);
      this.$el.append(right);
      return this;
  },show : function(_,notChange){

  }
});
