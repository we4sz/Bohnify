var PlaylistCard = Backbone.View.extend({
  events : {
    'click .playlistcardimage' : 'browse',
    'click .playlistcardname' : 'browse',
    'update': 'update'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.html("");
    var image = "/images/playlistdefault.png";
    var name = this.model.name;
    var text = this.model.author.nick;
    var tracks = this.model.tracks;
    if(this.model.image){
      image = imageUrl(this.model.image);
    }else if(tracks.length>0){
      var covers = [];
      tracks.forEach(function(track){
        if(track.album.cover && track.album.cover != ""){
          covers.push(track.album.cover);
        }
      });
      image = imageUrl(covers);
    }
    this.$el.addClass("playlistcardview");
    var html =    "<div class='playlistcardimagecon'>"
                + "<img class='playlistcardimage' src='"+image+"'/>"
                + "</div>"
                + "<div class='playlistcardtextcon'>"
                + "<div class='playlistcardname'>"+name+"</div>"
                + "<div class='playlistcardtext'>"+text+"</div>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    return this;
  },browse : function(){
    $(".playlistitem").trigger("selectfromuri",[this.model,true]);
  }, update: function(___,pl){
    if(pl.uri == this.model.uri){
      this.model = pl;
      this.render();
    }
    return false;
  }
});
