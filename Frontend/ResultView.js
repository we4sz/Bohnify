var ResultView = Backbone.View.extend({
  events : {
    'keyup' : 'test',
    'update' : 'update'
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
          var self = this;
          _.each(this.options.data.data.toArray(), function(track, i) {
              self.$el.append((new TrackView({model: track, ws : self.options.ws})).render().$el);
          });
        }else if(this.options.data.type == "album"){
          this.$el.append((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "artist"){
          this.$el.append((new ArtistView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "track"){


        }else if(this.options.data.type == "user"){


        }else if(this.options.data.type == "load"){
          var html = "<div class='resultloader'></div>";
          this.$el.html(html);
        }
      }
      return this;
  },keyevent : function(ev){
    if(this.$el.find(".selected").length > 0){
      if(ev.keyCode == 40 || ev.keyCode == 38){
        ev.preventDefault()
        if(ev.keyCode == 40 || ev.keyCode == 38){
          var parent =this.$el.find(".selected");
          var left = parent.nextAll();
          if(ev.keyCode == 38){
            parent = this.$el.find(".selected");
            left = parent.prevAll();
          }
          if(left.length > 0){
            var select = $(left.get(0)).trigger("select");
          }
        }
        return false;
      }else if(ev.keyCode == 13){
        $(".track.selected").trigger("playtrack");
        return false;
      }else if(ev.keyCode == 9 || ev.keyCode == 37){
        ev.preventDefault();
        if((ev.shiftKey && ev.keyCode == 9) || ev.keyCode == 37){
          var playlist = $(".playlist.passiveselected");
          if(playlist.length > 0){
            playlist.trigger("select");
          }else{
            var playlists = $(".playlist");
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
  }
});
