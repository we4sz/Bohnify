var ResultView = Backbone.View.extend({
  events : {
    'update' : 'update',
    'status' : 'newstatus',
    'play': 'play'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.keyevent.bind(this));
  },
  render : function(){
      if(this.options.data){
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          window.currentview = playlist.uri;
          window.location.assign("#"+playlist.uri);
          this.$el.html((new PlaylistView({model : playlist, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "search"){
          window.currentview = this.options.data.search;
          window.location.assign("#spotify:search:"+this.options.data.search);
          this.$el.html((new SearchView({model : this.options.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "album"){
          window.currentview = this.options.data.data.uri;
          window.location.assign("#"+this.options.data.data.uri);
          this.$el.html((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "artist"){
          window.currentview = this.options.data.data.uri;
          window.location.assign("#"+this.options.data.data.uri);
          this.$el.html((new ArtistView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "track"){
          window.currentview = this.options.data.search;
          window.location.assign("#"+this.options.data.search);
          this.$el.html((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          $(".track").trigger("selecturi",this.options.data.search);
        }else if(this.options.data.type == "user"){

        }else if(this.options.data.type == "queue"){
          if($(".queueview").length == 0){
            window.currentview = "spotify:queue";
            window.location.assign("#spotify:queue");
            this.$el.html((new QueueView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".queueview").trigger("newqueue",[this.options.data.data]);
          }
        }else if(this.options.data.type == "toplist"){
          window.currentview = "spotify:toplist";
          window.location.assign("#spotify:toplist");
          this.$el.html((new ToplistView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "history"){
          if($(".historyview").length == 0){
            window.currentview = "spotify:history";
            window.location.assign("#spotify:history");
            this.$el.html((new HistoryView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".historyview").trigger("newhistory",[this.options.data.data]);
          }
        }else if(this.options.data.type == "load"){
          var html = "<div class='resultloader'></div>";
          this.$el.html(html);
        }else if(this.options.data.type == "clear"){
          this.$el.html("");
        }else if(this.options.data.type == "mymusic"){
          window.currentview = "spotify:mymusic";
          window.location.assign("#spotify:mymusic");
          this.$el.html((new MyMusicView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }
      }
      if(this.options.status){
        this.$el.find(".track").trigger('markcurrent',[this.options.status]);
      }
      return this;
  },keyevent : function(ev){
    if(this.$el.find(".selected").length > 0){
      if((ev.keyCode == 40 || ev.keyCode == 38) && !ev.ctrlKey){
        ev.preventDefault();
        if(ev.keyCode == 40 || ev.keyCode == 38){
          var parent =this.$el.find(".selected");
          var tracks = $(".track");
          var index = tracks.index(parent);
          var next;
          if(ev.keyCode == 38 && index > 0){
            next = tracks[index-1];
          }else if(ev.keyCode == 40 && index < tracks.length){
            next = tracks[index+1];
          }
          if(next){
            var select = $(next).trigger("select");
          }
        }
        return false;
      }else if(ev.keyCode == 13){
        $(".track.selected").trigger("playtrack");
        return false;
      }else if(ev.keyCode == 9 || (ev.keyCode == 37 && !ev.ctrlKey && !ev.altKey)){
        ev.preventDefault();
        ev.fromResult=true;
        if((ev.shiftKey && ev.keyCode == 9) || (ev.keyCode == 37 && !ev.altKey)){
          var playlist = $(".playlistitem.passiveselected");
          if(playlist.length > 0){
            playlist.trigger("select");
          }else{
            var playlists = $(".playlistitem");
            if(playlists.length > 0){
              $(playlists.get(0)).trigger("select");
            }
          }
        }else{
          $("#search").focus();
        }
        return false;
      }else if(ev.keyCode == 46){
        $(".queueview").trigger("delete");
      }
    }
  },update : function(_,data) {
    if(this.options.data != data){
        this.options.data = data;
        this.render();
    }
    return false;
  }, newstatus : function(_,status){
    this.options.status = status;
    if(this.options.status){
      this.$el.find(".track").trigger('markcurrent',[this.options.status]);
    }
  }, play : function(ev,context,index,dontplay){
      var start = true;
      if(dontplay){
        start = false;
      }
      var ob = {play : {uri: context,start:start}};
      if(index >=0){
        ob.play.track = index;
      }
      this.options.ws.send(ob);
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      return false;
  }
});
