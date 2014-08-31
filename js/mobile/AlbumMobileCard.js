var AlbumMobileCard = Backbone.View.extend({
  events : {
    'click' : 'browse',
    'touchstart' : 'select',
    'touchend' : 'unselect'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var name = this.model.title;
    var tracks = this.model.tracks.length+" songs";
    var year = this.model.year;
    if(this.model.cover){
      image = imageUrl(this.model.cover);
    }
    this.$el.addClass("albumcard");
    var html =    "<img class='albumcardimage' src='"+image+"'/>"
                + "<div class='albumcardtextcon'>"
                + "<div class='albumcardname'>"+name+"</div>"
                + "<div class='albumcardtracks'>"+tracks+"</div>"
                + "<div class='albumcardyear'>"+year+"</div>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    return this;
  },browse : function(){
    $("#result").trigger("update",{type: "load"});
    this.options.ws.send({search : "spotify:"+this.model.uri});
  }, select:function(){
    this.$el.toggleClass("click");
  }, unselect:function(){
    this.$el.removeClass("click");
  }
});
