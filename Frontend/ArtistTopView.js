var ArtistTopView = Backbone.View.extend({
  events : {
    'play': 'play'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("artisttop");
      var left = $.parseHTML("<div class='artisttoptracks'></div>");
      var right = $.parseHTML("<div class='artistsimilar'></div>");
      $(left).append((new ArtistViewSeparator({model : "POPULAR"})).render().$el);
      _.each(this.model.get("toptracks").toArray(), function(track, i) {
        if(i<5){
          $(left).append((new TrackView({model: track, index: i,ws : this.options.ws})).render().$el);
        }
      }.bind(this))

      $(right).append((new ArtistViewSeparator({model : "RELATED ARTISTS"})).render().$el);
      _.each(this.model.get("similar").toArray(), function(artist, i) {
          if(i<4){
            $(right).append((new ArtistSimilarItem({model: artist, ws : this.options.ws})).render().$el);
          }
      }.bind(this));
      this.$el.append(left);
      this.$el.append(right);
      return this;
  },play : function(_,index){
    var tracks = this.model.get("toptracks").toJSON();
    var track = tracks[index].uri;
    tracks.splice(index,1);
    tracks = tracks.map(function(t){
      return t.uri;
    });
    var ob = JSON.stringify({play : {track : track,queue:tracks}});
    this.options.ws.send(ob);
  }
});
