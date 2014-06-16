var PlaylistItem = Backbone.View.extend({
  events : {
    'click .playlistfolder' : 'expand',
    'click .playlist' : 'show',
    'select': 'show',
    'expand' : 'expand',
    'play' : 'play'
  },initialize : function (options) {
    this.options = options || {};
    this.options.data = {type: "playlist", data:this.model};
    this.options.isbig = false;
  },
  render : function(){
    this.$el.addClass("playlistitem");
    var folderclass = this.model.get("playlists") ? (this.options.isbig ? "playlistfolder" : "playlistfolder") : "playlist";
    var imageclass = this.model.get("playlists") ? (this.options.isbig ? "folderminimize" : "foldermaximize") : "playlistnote";

    var html = $.parseHTML("<div class='"+folderclass+"'><div class='"+imageclass+"'></div>"
          + "<div class='playlistname'>"+this.model.get("name")+"</div></div>");
        this.$el.html(html);
    if(this.options.isbig){
      _.each(this.model.get("playlists"), function(playlist, i) {
          this.$el.append((new PlaylistItem({model: playlist, ws : this.options.ws, index:i})).render().$el);
      }.bind(this));
    }
    return this;
  },show : function(_,notChange){
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
    if(!notChange && this.$el.find(".playlistfolder").length == 0){
      $("#result").trigger("update",[this.options.data]);
    }
    return false;
  },click : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
  },expand : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
  },play : function(ev){
    if(this.$el.find(".playlistfolder").length > 0){
      this.expand();
    }else{
      var tracks = this.model.get("tracks").toJSON();
      tracks = tracks.map(function(t){
        return t.uri;
      });
      console.log(tracks);
      var ob = JSON.stringify({startqueue : tracks});
      this.options.ws.send(ob);
      return false;
    }
  }
});
