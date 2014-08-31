var PlaylistItem = Backbone.View.extend({
  events : {
    'click .playlistfolder' : 'expand',
    'click .playlist' : 'show',
    'dblclick .playlist' : 'play',
    'select': 'show',
    'expand' : 'expand',
    'play' : 'play',
    'contextmenu .playlist' : 'opencontext',
    "selectplaylist" : "forceselect",
    "passiveselect" : "passiveselect",
    "makeselect" : "select",
    "updateplaylist" : "update",
    "selectfromuri" : "selectfromuri"
  },initialize : function (options) {
    this.options = options || {};
    this.options.data = {type: "playlist", data:this.model};
    this.options.isbig = false;
  },
  render : function(){
    this.$el.html("");
    this.$el.addClass("playlistitem");
    var folderclass = this.model.playlists ? (this.options.isbig ? "playlistfolder" : "playlistfolder") : "playlist";
    var imageclass = this.model.playlists ? (this.options.isbig ? "folderminimize" : "foldermaximize") : "playlistnote";

    var html = $.parseHTML("<div class='"+folderclass+"'><div class='"+imageclass+"'></div>"
          + "<div class='playlistname'>"+this.model.name+"</div></div>");
        this.$el.html(html);
    if(this.options.isbig){
      _.each(this.model.playlists, function(playlist, i) {
          this.$el.append((new PlaylistItem({model: playlist, ws : this.options.ws, index:i})).render().$el);
      }.bind(this));
    }
    return this;
  },show : function(ev){
    var update = this.$el.hasClass("passiveselected") || this.$el.hasClass("selected");
    $("#contextmenu").remove();
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
    if(!update && this.$el.find(".playlistfolder").length == 0){
      $("#result").trigger("update",{type: "playlist",data: this.model});
    }
    return false;
  },click : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
  },expand : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
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
    this.show();
    $("#contextmenu").remove();
    var x = ev.clientX;
    var y = ev.clientY;
    var html =  "<div id='contextmenu'>" +
                "<div id='contextplay' class='contextitem'>Play</div>" +
                "<div id='contextqueue' class='contextitem'>Choose as Current Playlist</div>" +
                "<div id='contexturi' class='contextitem'>"+this.model.uri+"</div>" +
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
  }, forceselect : function(_, uri){
    if(uri == this.model.uri){
      $(".playlistitem.selected").removeClass("selected");
      $(".playlistitem.passiveselected").removeClass("passiveselected");
      passiveSelectAll(this.$el);
      takeInFocus($("#leftmenu"),this.$el);
    }
    return false;
  }, select : function(){
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
    return false;
  },passiveselect : function(_,passive){
      $(".playlistitem.selected").removeClass("selected");
      $(".playlistitem.passiveselected").removeClass("passiveselected");
      if(passive){
        this.$el.addClass("passiveselected");
      }else{
        passiveSelectAll(this.$el);
      }
    return false;
  }, update : function(_,pl){
    if(pl.uri == this.model.uri){
      this.model = pl;
      this.render();
    }
    return false;
  }, selectfromuri : function(_,pl,show){
    if(pl.uri == this.model.uri){
      var update = this.$el.hasClass("passiveselected") || this.$el.hasClass("selected");
      $("#contextmenu").remove();
      $(".playlistitem.selected").removeClass("selected");
      $(".playlistitem.passiveselected").removeClass("passiveselected");
      passiveSelectAll(this.$el);
      takeInFocus($("#leftmenu"),this.$el);
      if(show){
        $("#result").trigger("update",{type: "playlist",data: this.model});
      }
      return false;
    }
  }
});
