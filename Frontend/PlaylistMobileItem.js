var PlaylistMobileItem = Backbone.View.extend({
  events : {
    'click .playlistfolder' : 'expand',
    'click .playlist' : 'show',
    'click .playlistitemmenu' : 'opencontext',
    "update" : "update",
    'touchstart .playlistitemitem' : 'select',
    'touchend .playlistitemitem' : 'unselect'
  },initialize : function (options) {
    this.options = options || {};
    this.options.isbig = false;
  },
  render : function(){
    this.$el.html("");
    this.$el.addClass("playlistitem");
    var folderclass = this.model.playlists ? (this.options.isbig ? "playlistfolder" : "playlistfolder") : "playlist";


    var image = "/images/playlistdefault.png";
    var name = this.model.name;
    var text = "";
    if(this.model.playlists){
      text = this.model.playlists.length + " playlists";
      image = "/images/playlistfolder.png"
    }else{
      var tracks = this.model.tracks;
      var author = this.model.author.nick;
      text = "by "+author+" &#8226; "+tracks.length+" tracks";
      if(tracks.length>0){
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
                  "<img class='playlistitemimage' src='"+imageUrl(covers[1],true)+"'/>" +
                  "<img class='playlistitemimage' src='"+imageUrl(covers[2],true)+"'/>" +
                  "<img class='playlistitemimage' src='"+imageUrl(covers[3],true);
        }else{
          if(covers[0]){
            image = imageUrl(covers[0]);
          }
        }
      }
    }


    var html = $.parseHTML(
        "<div class='"+folderclass+" playlistitemitem'>"
      + "<div class='playlistitemimagecon'>"
      + "<img class='playlistitemimage' src='"+image+"'/>"
      + "</div>"
      + "<div class='playlistitemtext'>"
      + "<div class='playlistitemname'>"+name+"</div>"
      + "<div class='playlistitemdesc'>"+text+"</div>"
      + "</div>"
      + (!this.model.playlists ? "<div class='playlistitemmenu'></div>": "")
      + (this.model.playlists && this.options.isbig ? "<div class='folderminimize'></div>": "")
      + (this.model.playlists && !this.options.isbig ? "<div class='foldermaximize'></div>": "")
      + "</div>"

    );
    this.$el.html(html);


    if(this.options.isbig){
      this.model.playlists.forEach(function(playlist, i) {
          this.$el.append((new PlaylistMobileItem({model: playlist, ws : this.options.ws, index:i})).render().$el);
      }.bind(this));
    }
    return this;
  },show : function(ev){
    $("#result").trigger("update",{type: "playlist",data: this.model});
    $("#header").trigger("addbrowse",{type: "playlist",data: this.model});
    return false;
  },expand : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
  },play : function(ev){
    if(this.$el.find(".playlistfolder").length > 0){
      this.expand();
    }else{
      var tracks = this.model.tracks;
      tracks = tracks.map(function(t){
        return t.uri;
      });
      var ob = {startqueue : tracks};
      this.options.ws.send(ob);
      return false;
    }
  }, opencontext : function(ev){
    var add = $("#contextmenu").length == 0;
    $("#contextmenu").remove();
    if(add){
      var html =  "<div id='contextmenu'>" +
                  "<div id='contextplay' class='contextitem'>Play</div>" +
                  "<div id='contextqueue' class='contextitem'>Choose as Current Playlist</div>" +
                  "<div id='contextbrowse' class='contextitem'>Browse</div>" +
                  "</div>";
      var el = $($.parseHTML(html));

      el.find("#contextqueue").click(function(ev){
        var tracks = this.model.tracks;
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


      el.find("#contextbrowse").click(function(ev){
        $("#result").trigger("update",{type: "playlist",data: this.model});
        $("#header").trigger("addbrowse",{type: "playlist",data: this.model});
        el.remove();
      }.bind(this));

      el.find(".contextitem").on("touchstart",function(){
        $(this).css("background-color","#575757");
      });


      $(document.body).append(el);
      var h = el.find(".contextitem").outerHeight();
      el.css('height',(h*el.find(".contextitem").length)+"px");
      return false;
    }
  }, update : function(_,pl){
    if(pl.uri == this.model.uri){
      this.model = pl;
      this.render();
    }
  }, select:function(){
    this.$el.find(".playlistitemitem").toggleClass("click");
  }, unselect:function(){
    this.$el.find(".playlistitemitem").removeClass("click");
  }
});
