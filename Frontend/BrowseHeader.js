var BrowseHeader = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var text = "PLAYLIST";
    var name = "FÄÄST!";

    if(this.model instanceof Track){

    }else if(this.model instanceof Artist){
      name = this.model.get("name");
      text = "ARTIST";
      var cover = this.model.get("portrait");
      if(cover){
        var uri = cover.substring(14);
        image = "https://d3rt1990lpmkn.cloudfront.net/300/"+uri;
      }else{
        var albums = this.model.get("albums");
        if(albums.length>0){
          var cover = albums.at(0).get("cover");
          if(cover){
            var uri = cover.substring(14);
            image = "https://d3rt1990lpmkn.cloudfront.net/300/"+uri;
          }
        }
      }
    }else if(this.model instanceof Album){
      name = this.model.get("title");
      text = "ALBUM";
      if(this.model.get("cover")){
        var uri = this.model.get("cover").substring(14);
        image = "https://d3rt1990lpmkn.cloudfront.net/300/"+uri;
      }
    }else if(this.model instanceof Playlist){
      name = this.model.get("name");
      text = "PLAYLIST";
      var tracks = this.model.get("tracks");
      if(tracks.length>0){
        var covers = [];
        _.each(tracks.toArray(),function(){

        });
        var cover = tracks.at(0).get("album").get("cover");
        if(cover){
          var uri = cover.substring(14);
          image = "https://d3rt1990lpmkn.cloudfront.net/300/"+uri;
        }
      }
    }
    this.$el.addClass("browsehead");
    var html =  "<img class='browseimage' src='"+image+"'/>"
                + "<div class='browsecon'>"
                + "<div class='browsetext'>"+text+"</div>"
                + "<div class='browsename'>"+name+"</div>"
                + "<button class='browseplay'>Play</button>"
                + "<button class='browsemenu'>...</button>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    return this;
  },show : function(_,notChange){

  }
});
