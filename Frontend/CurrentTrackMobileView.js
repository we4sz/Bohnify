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
              html = "<div id='currentlayer'><div></div></div>"
              + "<img id='currentimage' src='/images/playlistdefault.png'/>"
              + "<div id='currenttext'>"
              + "<div id='currenttitle'></div>"
              + "<div id='currentartists'></div>"
              + "</div>"
              + "<div id='currentplayback' class='currentpaused'></div>";
      this.$el.html(html);
      return this;
  },update : function(_,status){
    $("#currentplayback").removeClass("currentpaused").removeClass("currentplay").addClass(status.paused ? "currentpaused" : "currentplay");

    var image = "/images/playlistdefault.png";
    var title = "";
    var artists = "";
    if(status && status.track){
      var cover = status.track.album.cover;
      if(cover){
        image = imageUrl(cover);
      }
      title = status.track.title;
      status.track.artists.forEach(function(artist, i) {
          artists += artist.name +",&nbsp;";
      });
      artists = artists.substring(0,artists.length-7);
    }

    $("#currentimage").attr("src",image);
    $("#currentlayer div").css("background-image","url('"+image+"')");
    $("#currentlayer").css("background-image","url('"+image+"')");
    $("#currenttitle").html(title);
    $("#currentartists").html(artists);
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
