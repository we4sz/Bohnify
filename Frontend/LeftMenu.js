var LeftMenu = Backbone.View.extend({
  events : {
    'makesmall' : 'makesmall',
    'makebig' : 'makebig',
    'click #queue' :  'getqueue',
    'select #queue' :  'getqueue',
    'click #history' :  'gethistory',
    'select #history' :  'gethistory',
    'click #toplist' :  'gettoplist',
    'select #toplist' :  'gettoplist',
    'click #starred' :  'getstarred',
    'select #starred' :  'getstarred'
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
      this.$el.append((new ArtistViewSeparator({model : "MAIN"})).render().$el);
      var html =  "<div class='playlistitem menuitem' id='toplist'><div class='playlistname'>Toplist</div></div>" +
                  "<div class='playlistitem menuitem' id='queue'><div class='playlistname'>Queue</div></div>" +
                  "<div class='playlistitem menuitem' id='history'><div class='playlistname'>History</div></div>" +
                  "<div class='playlistitem menuitem' id='starred'><div class='playlistname'>Starred</div></div>";
      this.$el.append($.parseHTML(html));
      this.$el.append((new ArtistViewSeparator({model : "YOUR MUSIC"})).render().$el);
    	_.each(this.model.toArray(), function(playlist, i) {
    		this.$el.append((new PlaylistItem({model: playlist, ws: this.options.ws,resultView : this.options.resultView})).render().$el);
    	}.bind(this));
	    return this;
	},keyevent : function(ev){
    if(this.$el.find(".selected").length > 0){
      if((ev.keyCode == 40 || ev.keyCode == 38) && !ev.ctrlKey){
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
  },getqueue : function(){
    this.select("#queue",true);
    if($(".queueview").length == 0 ){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(JSON.stringify({getqueue : true}));
    }
  },gethistory : function(){
    this.select("#history");
    if($(".historyview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(JSON.stringify({gethistory : true}));
    }
  },gettoplist : function(){
    this.select("#toplist",true);
    if($(".toplistview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(JSON.stringify({gettoplist : true}));
    }
  },getstarred : function(){
    this.select("#starred",true);
    if($(".starredview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(JSON.stringify({getstarred : true}));
    }
  }, select : function(target,first){
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll($(target));
    takeInFocus($("#leftmenu"),$(target),first);
    $(target).addClass("selected");
  }
});
