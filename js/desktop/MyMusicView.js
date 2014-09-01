var MyMusicView = Backbone.View.extend({
  events :{
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.addClass("mymusicview");
    this.$el.html("");
    this.model.forEach(function(pl){
      if(!pl.playlists){
        this.$el.append((new PlaylistCard({model: pl, ws: this.options.ws})).render().$el);
      }
    }.bind(this));
    setTimeout(function(){
      $(".playlistcardname").truncate({multiline : true,assumeSameStyle :true});
    },1);
    return this;
  }
});
