var TrackView = Backbone.View.extend({
  events : {
    'dblclick' : 'play',
    'click' : 'select',
    'select' : 'select',
    'playtrack': 'play',
    'click .trackalbumtext' : 'browsealbum',
    'click .trackartist' : 'browseartist'
  },initialize : function (options) {
    this.options = options || {};
    this.options.title =  options.title;
    this.options.artist =  options.artist;
    this.options.album=  options.album;
    this.options.duration =  options.duration;
    this.options.image =  options.image;
    this.options.popularity =  options.popularity;
  },tagName: "tr",
  render : function(){
    var artists = "";
    this.$el.addClass("track");
    _.each(this.model.get("artists").toArray(), function(artist, i) {
        artists += "<span class='trackartist'>"+artist.get("name")+"</span><span class='trackartistsseparator'>,&nbsp;</span>";
    });
    artists = artists.substring(0,artists.length-50);
    var html ="<td><div class='trackindex'>"+(this.options.index+1)+"</div></td>";
    if(this.options.image){
      var image = imageUrl(this.model.get("album").get("cover"));
      html += "<td><div class='resize trackimage'><img src='"+image+"'/></td>";
    }
    if(this.options.title){
      html += "<td><div class='resize tracktitle'>"+this.model.get("title")+"</div></td>";
    }
    if(this.options.artist){
      html += "<td><div class='resize trackartists'>"+artists+"</div></td>";
    }
    if(this.options.duration){
      html += "<td><div class='trackduration'>"+toMinutesAndSeconds(this.model.get("duration"))+"</div></td>";
    }
    if(this.options.album){
      html += "<td><div class='resize trackalbum'><span class='trackalbumtext'>"+this.model.get("album").get("title")+"</span></div></td>";
    }
    if(this.options.popularity){
      html += "<td><div class='trackpopularity'>"+this.model.get("popularity")+"</div></td>";
    }
    this.$el.html(html);
    return this;
  },play : function(){
    this.$el.parent().trigger("play",[this.options.index]);
  },select: function(){
    $(".track.selected").removeClass("selected");
    $(".track.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    var first = $(".track")[0] == this.$el[0];
    takeInFocus($("#result"),this.$el,first);
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
