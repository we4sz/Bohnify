var TrackView = Backbone.View.extend({
  events : {
    'dblclick .track' : 'play',
    'click .track' : 'select',
    'select' : 'select',
    'play': 'play',
    'click .trackalbumtext' : 'browsealbum',
    'click .trackartist' : 'browseartist'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var artists = "";
    _.each(this.model.get("artists").toArray(), function(artist, i) {
        artists += "<span class='trackartist'>"+artist.get("name")+"</span><span class='trackartistsseparator'>,&nbsp;</span>";
    });
    artists = artists.substring(0,artists.length-50);

    var html =   "<div class='track'>"
                + "<div class='tracktitle'>"+this.model.get("title")+"</div>"
                + "<div class='trackartists'>"+artists+"</div>"
                + "<div class='trackduration'>"+toMinutesAndSeconds(this.model.get("duration"))+"</div>"
                + "<div class='trackalbum'><span class='trackalbumtext'>"+this.model.get("album").get("title")+"</span></div>"
                + "</div>";
    this.$el.html(html);
    return this;
  },play : function(){
    var ob = JSON.stringify({play : {track : this.model.get("uri"),queue:[]}});
    this.options.ws.send(ob);
  },select: function(){
    $(".track.selected").removeClass("selected");
    $(".track.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el.find(".track"));
    takeInFocus(this.$el.parent(),this.$el);
  },browsealbum : function(){
    $("#result").trigger("update",{type: "load"});
    var ob = JSON.stringify({search : this.model.get("album").get("uri")});
    this.options.ws.send(ob);
  },browseartist : function(e){
    $("#result").trigger("update",{type: "load"});
    var index = $(e.target).index()/2;
    var uri = this.model.get("artists").at(index).get("uri");
    var ob = JSON.stringify({search : uri});
    this.options.ws.send(ob);
  }
});
