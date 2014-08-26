var ArtistTopView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("artisttop");
      var left = $.parseHTML("<div class='artisttoptracks'></div>");
      var right = $.parseHTML("<div class='artistsimilar'></div>");
      $(left).append((new ArtistViewSeparator({model : "POPULAR"})).render().$el);
      $(left).append((new TracksView({model: this.model.toptracks, ws : this.options.ws,artist:false,album:false,image:true,max:5})).render().$el);


      $(right).append((new ArtistViewSeparator({model : "RELATED ARTISTS"})).render().$el);
      this.model.similar.forEach(function(artist, i) {
          if(i<4){
            $(right).append((new ArtistSimilarItem({model: artist, ws : this.options.ws})).render().$el);
          }
      }.bind(this));
      this.$el.append(left);
      this.$el.append(right);
      return this;
  }
});
