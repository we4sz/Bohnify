var CurrentTrackView = Backbone.View.extend({
  events : {
    'status' : 'update',
    'mouseover' : 'mouseover',
    'mouseout' : 'mouseout',
    'click .currentresize.small' : 'makebig',
    'click .currentresize.big' : 'makesmall'

  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      var html ="";
      if(this.options.track){
        var image = "/images/playlistdefault.png";
        var cover = this.options.track.get("album").get("cover");
        if(cover){
          var uri = cover.substring(14);
          image = "https://d3rt1990lpmkn.cloudfront.net/300/"+uri;
        }
        var title = this.options.track.get("title");
        var artists = "";
        _.each(this.options.track.get("artists").toArray(), function(artist, i) {
            artists += "<span class='currentartist'>"+artist.get("name")+"</span><span class='currentartistsseparator'>,&nbsp;</span>";
        });
        artists = artists.substring(0,artists.length-52);
        var sizeclass = "small";
        if(this.options.isbig){
          sizeclass = "big";
        }
        html =    "<img class='currentimage "+sizeclass+"' src='"+image+"'/>"
                + "<div class='currentcon "+sizeclass+"'>"
                + "<div class='currenttitle "+sizeclass+"'>"+title+"</div>"
                + "<div class='currentartists "+sizeclass+"'>"+artists+"</div>"
                + "</div>"
                + "<div class='currentresize "+sizeclass+"'></div>";
      }
      this.$el.html(html);
  },update : function(_,status){
    this.options.track = status.track;
    this.render();
  },mouseover : function(){
    this.$el.find(".currentresize").css("visibility","visible");
  },mouseout : function(){
    this.$el.find(".currentresize").css("visibility","hidden");
  },makesmall : function(){
    this.options.isbig = false;
    this.$el.removeClass("big").addClass("small");
    $("#leftmenu").trigger("makebig");
    this.render();
  },makebig : function(){
    this.options.isbig = true;
    this.$el.removeClass("small").addClass("big");
    $("#leftmenu").trigger("makesmall");
    this.render();
  }
});
