var BrowseHeader = Backbone.View.extend({
  events : {
    'click .browseplay' : 'play',
    'click .browsemenu' : 'menu'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var text = "PLAYLIST";
    var name = "FÄÄST!";
    var addCreated = false;

    if(this.model instanceof Track){

    }else if(this.model instanceof Artist){
      name = this.model.get("name");
      text = "ARTIST";
      var cover = this.model.get("portrait");
      if(cover){
        image = imageUrl(cover);
      }else{
        var albums = this.model.get("albums");
        if(albums.length>0){
          var cover = albums.at(0).get("cover");
          if(cover){
            image = imageUrl(cover);
          }
        }
      }
    }else if(this.model instanceof Album){
      addCreated = true;
      name = this.model.get("title");
      text = "ALBUM";
      if(this.model.get("cover")){
        image = imageUrl(this.model.get("cover"));
      }
    }else if(this.model instanceof Playlist){
      addCreated = true;
      name = this.model.get("name");
      text = "PLAYLIST";
      var tracks = this.model.get("tracks");
      if(tracks.length>0){
        var covers = [];
        _.each(tracks.toArray(),function(track){
          if(track.get("album").get("cover") &&
          track.get("album").get("cover") != "" &&
          covers.indexOf(track.get("album").get("cover")) < 0){
            covers.push(track.get("album").get("cover"));
          }
        });

        if(covers.length >= 4){
          image = imageUrl(covers[0],true)+"'/>" +
                  "<img class='browseimage' src='"+imageUrl(covers[1],true)+"'/>" +
                  "<img class='browseimage' src='"+imageUrl(covers[2],true)+"'/>" +
                  "<img class='browseimage' src='"+imageUrl(covers[3],true);
        }else{
          if(covers[0]){
            image = imageUrl(covers[0]);
          }
        }
      }
    }else if(this.model instanceof User){

    }
    this.$el.addClass("browsehead");
    var html =  "<div class='browseheadtop'>"
                + "<div class='browseimagecon'>"
                + "<img class='browseimage' src='"+image+"'/>"
                + "</div>"
                + "<div class='browsecon'>"
                + "<div class='browsetext'>"+text+"</div>"
                + "<div class='browsename'>"+name+"</div>"
                + "<button class='browseplay'>Play</button>"
                + "<button class='browsemenu'>...</button>"
                + "</div>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    if(addCreated){
      this.$el.append(new CreatedHead({model : this.model, ws: this.options.ws}).render().$el);
    }
    return this;
  }, play : function(){
    var tracks = this.getTracks();
    tracks = tracks.map(function(t){
      return t.uri;
    });
    this.options.ws.send({startqueue : tracks})
  }, menu : function(ev){
    $("#contextmenu").remove();
    var x = ev.clientX;
    var y = ev.clientY;
    var html =  "<div id='contextmenu'>" +
                "<div id='contextplay' class='contextitem'>Play</div>" +
                "<div id='contextqueue' class='contextitem'>Queue</div>" +
                "<div id='contexturi' class='contextitem'>"+this.model.get("uri")+"</div>" +
                "</div>";
    var el = $($.parseHTML(html));

    el.find("#contextqueue").click(function(ev){

      var tracks = this.getTracks();
      tracks = tracks.map(function(t){
        return t.uri;
      });
      this.options.ws.send({standardqueue: tracks});
      el.remove();
    }.bind(this));

    el.find("#contextplay").click(function(ev){
      this.play();
      $("#contextmenu").remove();
    }.bind(this));


    $(document.body).append(el);

    var h = el[0].clientHeight;
    var w = el[0].clientWidth;
    var mw = $(window).innerWidth();
    var mh = $(window).innerHeight();

    if(y + h > mh){
      el.css('top',(y-h)+"px");
    }else{
      el.css('top',y+"px");
    }

    if(x+w>mw){
      el.css('left',(x-w)+"px");
    }else{
      el.css('left',x+"px");
    }
    return false;
  }, getTracks : function(){
    var tracks;
    if(this.model instanceof Playlist){
      tracks = this.model.get("tracks").toJSON();
    }else if(this.model instanceof Album){
      tracks = this.model.get("tracks").toJSON();
    }else if(this.model instanceof Artist){
      tracks = this.model.get("toptracks").toJSON();
    }else if(this.model instanceof Track){
      tracks = [this.model];
    }
    return tracks;
  }
});
