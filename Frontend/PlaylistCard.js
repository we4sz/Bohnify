var PlaylistCard = Backbone.View.extend({
  events : {
    'click .playlistcardimage' : 'browse',
    'click .playlistcardname' : 'browse'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var name = this.model.name;
    var text = this.model.author.nick;
    var tracks = this.model.tracks;
    if(tracks.length>0){
      var covers = [];
      _.each(tracks,function(track){
        if(track.album.cover &&
        track.album.cover != "" &&
        covers.indexOf(track.album.cover) < 0){
          covers.push(track.album.cover);
        }
      });

      if(covers.length >= 4){
        image = imageUrl(covers[0],true)+"'/>" +
                "<img class='playlistcardimage' src='"+imageUrl(covers[1],true)+"'/>" +
                "<img class='playlistcardimage' src='"+imageUrl(covers[2],true)+"'/>" +
                "<img class='playlistcardimage' src='"+imageUrl(covers[3],true);
      }else{
        if(covers[0]){
          image = imageUrl(covers[0]);
        }
      }
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
  }
});
