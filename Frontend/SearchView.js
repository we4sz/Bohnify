var SearchView = Backbone.View.extend({
  events : {
    'play' : 'play'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("searchview");
      _.each(this.model.toArray(), function(track, i) {
          this.$el.append((new TrackView({model: track, ws : this.options.ws, index:i})).render().$el);
      }.bind(this));
      return this;
  },play : function(_,index){
    var tracks = this.model.toJSON();
    var track = tracks[index].uri;
    tracks.splice(index,1);
    tracks = tracks.map(function(t){
      return t.uri;
    });
    var ob = JSON.stringify({play : {track : track,queue:tracks}});
    this.options.ws.send(ob);
  }
});
