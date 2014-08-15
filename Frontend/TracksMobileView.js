var TracksMobileView = Backbone.View.extend({
  events : {
    'play': 'play',
    "repainttracks" : "repaint"
  },
  initialize : function (options) {
    this.options = options || {};
    this.options.extraclass = typeof options.extraclass !== 'undefined' ? options.extraclass : "";
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("tracksview");
      this.model.forEach(function(track, i) {
        this.$el.append((new TrackMobileView({model: track, index: i, ws: this.options.ws, extraclass: this.options.extraclass})).render().$el);
      }.bind(this));
      return this;
  },play : function(_,index){
    console.log("yeah")
    var tracks = this.model.slice(0);
    var track = tracks[index].uri;
    tracks.splice(index,1);
    tracks = tracks.map(function(t){
      return t.uri;
    });
    var ob = {play : {track : track,queue:tracks}};
    this.options.ws.send(ob);
  }, repaint : function(){
    var scroll = this.$el.scrollTop();
    this.render();
    this.$el.scrollTop(scroll);
  }
});
