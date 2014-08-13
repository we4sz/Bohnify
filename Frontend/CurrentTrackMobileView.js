var CurrentTrackMobileView = Backbone.View.extend({
  events : {
    'status' : 'update',
    'click .currentplay' : 'pause',
    'click .currentpaused' : 'play',
    'click' : 'opencontrol'

  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      var html ="";
      var image = "/images/playlistdefault.png";
      var title = "";
      var artists = "";
      if(this.options.status && this.options.status.track){
        var cover = this.options.status.track.album.cover;
        if(cover){
          image = imageUrl(cover);
        }
        title = this.options.status.track.title;
        _.each(this.options.status.track.artists, function(artist, i) {
            artists += artist.name +",&nbsp;";
        });
        artists = artists.substring(0,artists.length-7);
      }
      this.$el.css("background-image","url('"+image+"')");
      html =    "<img class='currentimage' src='"+image+"'/>"
              + "<div class='currentlayer'>"
              + "<div class='currenttitle'>"+title+"</div>"
              + "<div class='currentartists'>"+artists+"</div>"
              + "</div>"
              + "<div class='"+ (this.options.status.paused ? "currentpaused" : "currentplay") +"'></div>";
      this.$el.html(html);
  },update : function(_,status){
    this.options.status = status;
    this.render();
  },play : function(ev){
    this.options.ws.send({pause: true});
    ev.stopPropagation();
    return false;
  },pause : function(ev){
    this.options.ws.send({pause: true});
    ev.stopPropagation();
    return false;
  },opencontrol : function(ev){
    $("#bottom").trigger("show");
  }
});
