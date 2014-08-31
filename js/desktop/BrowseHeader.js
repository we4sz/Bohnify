var BrowseHeader = Backbone.View.extend({
  events : {
    'click .browseplay' : 'play',
    'click .browsemenu' : 'menu'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var text = "";
    var name = "";
    var addCreated = false;

    if(this.model.uri.indexOf(":track:")>=0){

    }else if(this.model.uri.indexOf(":artist:")>=0){
      name = this.model.name;
      text = "ARTIST";
      var cover = this.model.portrait;
      if(cover){
        image = imageUrl(cover);
      }else{
        var albums = this.model.albums;
        if(albums.length>0){
          var cover = albums.at(0).cover;
          if(cover){
            image = imageUrl(cover);
          }
        }
      }
    }else if(this.model.uri.indexOf(":album:")>=0){
      addCreated = true;
      name = this.model.title;
      text = "ALBUM";
      if(this.model.cover){
        image = imageUrl(this.model.cover);
      }
    }else if(this.model.uri.indexOf(":playlist:")>=0 || this.model.uri.indexOf(":starred")>=0){
      addCreated = true;
      name = this.model.name;
      text = "PLAYLIST";
      var tracks = this.model.tracks;
      if(this.model.image){
        image = imageUrl(this.model.image);
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
    }else if(this.model.uri.indexOf(":user:")>=0){

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
                "<div id='contexturi' class='contextitem'>"+this.model.uri+"</div>" +
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
    if(this.model.uri.indexOf(":playlist:")>=0){
      tracks = this.model.tracks;
    }else if(this.model.uri.indexOf(":album:")>=0){
      tracks = this.model.tracks;
    }else if(this.model.uri.indexOf(":artist:")>=0){
      tracks = this.model.toptracks;
    }else if(this.model.uri.indexOf(":track:")>=0){
      tracks = [this.model];
    }
    return tracks;
  }
});
