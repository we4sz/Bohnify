var SuggestItem = Backbone.View.extend({
  events : {
    'mousedown' : 'browse',
    'enter': 'browse'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var html = "";
    this.$el.addClass("suggestitem");
    if(this.model.uri){
      var name = "";
      var extra = "";
      var img = "/images/playlistdefault.png";
      if(this.model.uri.indexOf("spotify:track") == 0){
        var artists = "";
        this.model.artists.forEach(function(artist, i) {
          artists += artist.name;
          if(i < this.model.artists.length -1){
            artists += ",&nbsp;";
          }
        }.bind(this));
        name = this.model.title;
        img = imageUrl(this.model.album.cover);
        extra = artists;
      }else if(this.model.uri.indexOf("spotify:album") == 0){
        name = this.model.title;
        img = imageUrl(this.model.cover);
        extra = this.model.artist.name;
      }else if(this.model.uri.indexOf("spotify:artist") == 0){
        name = this.model.name;
        if(this.model.portrait){
          img = imageUrl(this.model.portrait);
        }else{
          img = "/images/similarimage.png";
        }
      }else if(this.model.uri.indexOf(":playlist:") >= 0){
        name = this.model.name;
        var tracks = this.model.tracks;
        if(this.model.image){
          img = imageUrl(this.model.image);
        }else if(tracks.length>0){
          var covers = [];
          _.each(tracks,function(track){
            if(track.album.cover &&
            track.album.cover != "" &&
            covers.indexOf(track.album.cover) < 0){
              covers.push(track.album.cover);
            }
          });

          if(covers.length >= 4){
            img = imageUrl(covers[0],true)+"'/>" +
                    "<img class='suggestimage' src='"+imageUrl(covers[1],true)+"'/>" +
                    "<img class='suggestimage' src='"+imageUrl(covers[2],true)+"'/>" +
                    "<img class='suggestimage' src='"+imageUrl(covers[3],true);
          }else{
            if(covers[0]){
              img = imageUrl(covers[0]);
            }
          }
        }
      }
      html = "<div class='suggestimagecon'>"
            + "<img class='suggestimage' src='"+img+"'/>"
            + "</div>"
            + "<div class='suggesttext'>"
            + "<div class='suggestname'>"+name+"</div>"
            + (extra != "" ? ("<div class='suggestextra'>"+extra+"</div>") : "")
            + "</div>";
    }else{
      html =  "<div class='suggestsearch'>"+this.model+"</div>";
    }
    this.$el.html(html);
    return this;
  },browse: function(){
    if(this.model.uri){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : "spotify:"+this.model.uri});
      $("#suggest").trigger("hide");
      $("#search").blur();
    }else if(this.model.indexOf("Search for: ") == 0){
      var val = $("#search").val();
      $("#suggest").trigger("addsearch",val);
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : "spotify:"+val});
      $("#suggest").trigger("hide");
      $("#search").blur();
    }else{
      $("#header").trigger("setsearch",this.model);
    }
    return false;
  }
});
