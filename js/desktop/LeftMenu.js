var LeftMenu = Backbone.View.extend({
  events : {
    'makesmall' : 'makesmall',
    'makebig' : 'makebig',
    'click #menuqueue' :  'getqueue',
    'select #menuqueue' :  'getqueue',
    'click #menuhistory' :  'gethistory',
    'select #menuhistory' :  'gethistory',
    'click #menumymusic' :  'getmymusic',
    'select #menumymusic' :  'getmymusic',
    'click #menutoplist' :  'gettoplist',
    'select #menutoplist' :  'gettoplist',
    "forceselect" : "forceselect",
    "newcon" : "newcon",
    'updateplaylist': 'update',
    'updateplaylist .playlistitem': 'abort'
  },
  initialize: function(options) {
      this.options = options || {};
      this.options.un = "";
      this.options.pass = "";
      $(document).bind("keydown",this.keyevent.bind(this));
	},
  render: function() {
      this.$el.html("")
      this.$el.append((new ArtistViewSeparator({model : "MAIN"})).render().$el);
      var html =  "<div class='playlistitem menuitem' id='menumymusic'><div class='playlistname'>My Music</div></div>" +
                  "<div class='playlistitem menuitem' id='menutoplist'><div class='playlistname'>Toplist</div></div>" +
                  "<div class='playlistitem menuitem' id='menuqueue'><div class='playlistname'>Queue</div></div>" +
                  "<div class='playlistitem menuitem' id='menuhistory'><div class='playlistname'>History</div></div>";
      this.$el.append($.parseHTML(html));
      this.$el.append((new ArtistViewSeparator({model : "YOUR MUSIC"})).render().$el);
    	_.each(this.model, function(playlist, i) {
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
      }else if(ev.keyCode == 9 || (ev.keyCode == 39 && !ev.ctrlKey && !ev.altKey)){
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
      }else if(ev.keyCode == 37 && $(".selected .playlistfolder").length>0 && !ev.altKey){
        ev.preventDefault();
        $(".selected .playlistfolder").trigger("expand");
        return false;
      }else if(ev.keyCode == 37 && $(".playlistitem .playlistitem.selected").length>0 && !ev.altKey){
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
    this.select("#menuqueue",true);
    if($(".queueview").length == 0 ){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({getqueue : true});
    }
  },gethistory : function(){
    this.select("#menuhistory");
    if($(".historyview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gethistory : true});
    }
  },gettoplist : function(){
    this.select("#menutoplist",true);
    if($(".toplistview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gettoplist : true});
    }
  },getmymusic : function(){
    this.select("#menumymusic",true);
    if($(".mymusicview").length == 0){
      $("#result").trigger("update",{type: "mymusic", data:this.model});
    }
  }, select : function(target,first,passive){
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll($(target));
    takeInFocus($("#leftmenu"),$(target),first);
    $(target).removeClass("selected").addClass(passive ? "passiveselected" : "selected");
  }, forceselect : function(_,div){
    this.select(div);
  }, newcon : function(_,pl){
    var selected = $(".playlistitem.selected").index();
    selected = selected - (selected > 5 ? 2 : 1);
    var passive = $(".playlistitem.passiveselected").index();
    passive = passive - (passive > 5 ? 2 : 1);
    this.model = pl;
    this.render();
    if(selected >= 0 && selected < this.model.length){
      this.select($(this.$el.find(".playlistitem").get(selected)),selected == 0);
    }else if(passive >= 0 && passive < this.model.length){
      this.select($(this.$el.find(".playlistitem").get(passive)),passive == 0,true);
    }else{
      this.select("#menumymusic",true, passive >= 0);
    }
  }, update: function(asd,pl){
    function loop(con){
      for(var i = 0; i<con.length;i++){
        var playlist = con[i];
        if(playlist.playlists){
          if(loop(playlist.playlists)){
            break;
          }
        }else{
          if(playlist.uri == pl.uri){
            con[i] = pl;
            return true;
          }
        }
      };
    }
    if(this.model){
      loop(this.model);
    }
    return false;
  },abort: function(){
    return false;
  }
});
