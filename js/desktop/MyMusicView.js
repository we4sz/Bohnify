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
      $(".playlistcardname").each(function(i){
        if($(this).html().length > 30){
          setTimeout(function(){
            $(this).truncate({multiline : true,assumeSameStyle :true});
          }.bind(this),1);
        }
      })
    },1);
    return this;
  }
});
