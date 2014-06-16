var PlaylistView = Backbone.View.extend({
  events : {
    'play' : 'play'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("playlistview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.get("tracks").length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>The playlist is currently empty</div>"));
      }else{
        _.each(this.model.get("tracks").toArray(), function(track, i) {
            this.$el.append((new TrackView({model: track, ws : this.options.ws, index:i})).render().$el);
        }.bind(this));
      }
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
