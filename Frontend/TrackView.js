var TrackView = Backbone.View.extend({
  events : {
    'dblclick .track' : 'play',
    'click .track' : 'select'
  },
  render : function(){
    var artists = "";
    _.each(this.model.get("artists").toArray(), function(artist, i) {
        artists += "<div class='trackartist'>"+artist.get("name")+"</div><span class='trackartistsseparator'>,&nbsp;</span>";
    });
    artists = artists.substring(0,artists.length-50);

    var html =   "<div class='track'>"
                + "<div class='tracktitle'>"+this.model.get("title")+"</div>"
                + "<div class='trackartists'>"+artists+"</div>"
                + "<div class='trackduration'>"+toMinutesAndSeconds(this.model.get("duration"))+"</div>"
                + "<div class='trackalbum'>"+this.model.get("album").get("title")+"</div>"
                + "</div>";
    this.$el.html(html);
    return this;
  },play : function(){
    alert(this.model.get("uri"));
  },select: function(){
    $(".track.selected").removeClass("selected");
    $(".track.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el.find(".track"));
  }
});
