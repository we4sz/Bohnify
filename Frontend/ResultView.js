var ResultView = Backbone.View.extend({
  events : {
    'keyup' : 'test',
    'update' : 'update',
    'status' : 'newstatus'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.keyevent.bind(this));
  },
  render : function(){
      this.$el.html("");
      if(this.options.data){
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          this.$el.append((new PlaylistView({model : playlist, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "search"){
          this.$el.append((new SearchView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "album"){
          this.$el.append((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "artist"){
          this.$el.append((new ArtistView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "track"){
          this.$el.append((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          $(".track").trigger("selecturi",this.options.data.search)
        }else if(this.options.data.type == "user"){

        }else if(this.options.data.type == "queue"){
          this.$el.append((new QueueView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "toplist"){
          this.$el.append((new ToplistView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "history"){
          this.$el.append((new HistoryView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "load"){
          var html = "<div class='resultloader'></div>";
          this.$el.html(html);
        }
      }
      if(this.options.status){
        this.$el.find(".track").trigger('markcurrent',[this.options.status]);
      }
      return this;
  },keyevent : function(ev){
    if(this.$el.find(".selected").length > 0){
      if(ev.keyCode == 40 || ev.keyCode == 38){
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
      }else if(ev.keyCode == 9 || (ev.keyCode == 37 && !ev.ctrlKey)){
        ev.preventDefault();
        ev.fromResult=true;
        if((ev.shiftKey && ev.keyCode == 9) || ev.keyCode == 37){
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
      }
    }
  },update : function(_,data) {
    if(this.options.data != data){
        this.options.data = data;
        this.render();
    }
  }, newstatus : function(_,status){
    this.options.status = status;
    if(this.options.status){
      this.$el.find(".track").trigger('markcurrent',[this.options.status]);
    }
  }
});
