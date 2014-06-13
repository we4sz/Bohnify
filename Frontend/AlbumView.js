var AlbumView = Backbone.View.extend({
  events : {
    'play': 'play'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("albumview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      var self =this;
      _.each(this.model.get("tracks").toArray(), function(track, i) {
          self.$el.append((new TrackView({model: track, ws : self.options.ws,index:i})).render().$el);
      });
      return this;
  },play : function(_,index){
    var tracks = this.model.get("tracks").toJSON();
    var track = tracks[index].uri;
    tracks.splice(index,1);
    tracks = tracks.map(function(t){
      return t.uri;
    });
    var ob = JSON.stringify({play : {track : track,queue:tracks}});
    this.options.ws.send(ob);
  }
});
