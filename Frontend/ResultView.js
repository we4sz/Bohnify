var ResultView = Backbone.View.extend({
  events : {
    'keyup' : 'test'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.keyevent.bind(this));
  },
  render : function(){
      this.$el.html("");
      if(this.options.data){
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          var self = this;
          _.each(playlist.get("tracks").toArray(), function(track, i) {
							self.$el.append((new TrackView({model: track})).render().$el);
					});
        }else if(this.options.data.type == "search"){


        }else if(this.options.data.type == "album"){


        }else if(this.options.data.type == "artist"){


        }else if(this.options.data.type == "track"){


        }else if(this.options.data.type == "user"){


        }else if(this.options.data.type == "load"){


        }
      }
      return this;
  },keyevent : function(ev){
    if(ev.keyCode == 40 || ev.keyCode == 38 || ev.keyCode == 39||ev.keyCode == 37){
      ev.preventDefault()
      if(this.$el.find(".selected").length > 0){
        if(ev.keyCode == 40 || ev.keyCode == 38){
          var parent =this.$el.find(".selected").parent();
          var left = parent.nextAll();
          if(ev.keyCode == 38){
            parent = this.$el.find(".selected").parent();
            left = parent.prevAll();
          }
          if(left.length > 0){
            $(".track.selected").removeClass("selected");
            var select = $(left.get(0)).find(".track").trigger("select");
          }
        }else if(ev.keyCode == 37){
          this.$el.blur();
          var playlist = $(".playlist.passiveselected");
          if(playlist.length > 0){
            playlist.removeClass("passiveselected").trigger("select");
          }else{
            var playlists = $(".playlist");
            if(playlists.length > 0){
              $(playlists.get(0)).trigger("select");
            }
          }
        }
      }
    }else if(ev.keyCode == 13){

    }
  }
});
