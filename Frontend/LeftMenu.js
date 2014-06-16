var LeftMenu = Backbone.View.extend({
  events : {
    'makesmall' : 'makesmall',
    'makebig' : 'makebig'
  },
  initialize: function(options) {
			this.model.on('add', this.render, this);
      this.model.on('remove', this.render, this);
      this.model.on('reset', this.render, this);
      this.options = options || {};
      this.options.un = "";
      this.options.pass = "";
      $(document).bind("keydown",this.keyevent.bind(this));
	},
  render: function() {
    	this.$el.html('');
    	_.each(this.model.toArray(), function(playlist, i) {
    		this.$el.append((new PlaylistItem({model: playlist, ws: this.options.ws,resultView : this.options.resultView})).render().$el);
    	}.bind(this));
	    return this;
	},keyevent : function(ev){
    if(this.$el.find(".selected").length > 0){
      if(ev.keyCode == 40 || ev.keyCode == 38){
        ev.preventDefault();
        if(ev.keyCode == 40 || ev.keyCode == 38){
          var parent =this.$el.find(".selected");
          var items = $(".playlistitem");
          var index = items.index(parent);
          var next;
          if(ev.keyCode == 38 && index > 0){
            next = items[index-1];
          }else if(ev.keyCode == 40 && index < items.length){
            next = items[index+1];
          }
          if(next){
            var select = $(next).trigger("select");
          }
        }
        return false;
      }else if(ev.keyCode == 9 || (ev.keyCode == 39 && !ev.ctrlKey)){
        ev.preventDefault();
        if(ev.shiftKey && ev.keyCode == 9){
          $("#search").focus();
        }else if(ev.keyCode == 39 && $(".selected .playlistfolder").length>0){
          $(".selected .playlistfolder").trigger("expand");
        }else{
          var track = $(".track.passiveselected");
          if(track.length > 0){
            track.trigger("select");
          }else{
            var tracks = $(".track");
            if(tracks.length > 0){
              $(tracks.get(0)).trigger("select");
            }
          }
        }
        return false;
      }else if(ev.keyCode == 37 && $(".selected .playlistfolder").length>0){
        ev.preventDefault();
        $(".selected .playlistfolder").trigger("expand");
        return false;
      }else if(ev.keyCode == 37 && $(".playlistitem .playlistitem.selected").length>0){
        if(!ev.fromResult){
        ev.preventDefault();
        $(".playlistitem .playlistitem.selected").trigger("expand");
        return false;
        }
      }else if(ev.keyCode == 13){
        ev.preventDefault();
        $(".selected").trigger("play");
        return false;
      }
    }
  },makebig : function(){
    this.$el.removeClass("small").addClass("big");
  },makesmall : function(){
    this.$el.removeClass("big").addClass("small");
  }
});
