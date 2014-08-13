var HeaderView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headback.active' : 'back',
    'click #headfoward.active' : 'foward',
    'focusin #search' : 'focus',
    'keydown #search' : 'tabb',
    'addbrowse' : 'add'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.takefocus.bind(this));
    this.options.future = [];
    this.options.history = [];
    this.options.current;
  },
  render : function(){
      var html =  " <div id='headback' class='disable head'></div>"
                  + "<div id='headfoward' class='disable head'></div>"
                  + " <input id='search' results=0 type='search' placeholder='Search'  class='head'/>";
      this.$el.html(html);
      return this;
  },
  search : function(ev){
    var val = this.$el.find("#search").val();
    if(val){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : val});
    }
  },back : function(){
    this.options.future.push(this.options.current);
    this.options.current = this.options.history.pop();
    if(this.options.current.type === "playlist"){
      $(".playlistitem").trigger("selectfromuri",this.options.current.data);
    }else if(this.options.current.type === "mymusic"){
      $("#mymusic").trigger("select",true);
    }else{
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(this.options.current,true);
    }
    this.fixClasses();
  },foward : function(){
    this.options.history.push(this.options.current);
    this.options.current = this.options.future.pop();
    if(this.options.current.type === "playlist"){
      $(".playlistitem").trigger("selectfromuri",this.options.current.data);
    }else if(this.options.current.type === "mymusic"){
      $("#mymusic").trigger("select",true);
    }else{
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(this.options.current,true);
    }
    this.fixClasses();
  },focus : function(){
    passiveSelectAll();
    this.$el.find("#search").select();
  },tabb : function(ev){
    if(ev.keyCode == 9){
      ev.preventDefault();
      $(ev.target).blur();
      if(ev.shiftKey){
        var track = $(".track.passiveselected");
        if(track.length > 0){
          track.trigger("select");
        }else{
          var tracks = $(".track");
          if(tracks.length > 0){
            $(tracks.get(0)).trigger("select");
          }
        }
      }else{
        var playlist = $(".playlistitem.passiveselected");
        if(playlist.length > 0){
          playlist.trigger("select");
        }else{
          var playlists = $(".playlist");
          if(playlists.length > 0){
            $(playlists.get(0)).trigger("select");
          }
        }
      }
      return false;
    }

  },takefocus : function(ev){
    if(ev.keyCode == 76 && ev.ctrlKey){
      ev.preventDefault();
      this.$el.find("#search").focus();
      return false;
    }else if(this.$el.find("#headback").hasClass("active") && ev.keyCode == 37 && ev.altKey){
      this.back();
      return false;
    }else if(this.$el.find("#headfoward").hasClass("active") && ev.keyCode == 39 && ev.altKey){
      this.foward();
      return false;
    }
  }, add: function(_, command){
    if(this.options.current){
      this.options.history.push(this.options.current);
    }
    this.options.current = command;
    this.options.future = []
    this.fixClasses();
  }, fixClasses : function(){
    this.$el.find("#headback").removeClass("disable").removeClass("active").addClass(this.options.history.length > 0 ? "active" : "disable");
    this.$el.find("#headfoward").removeClass("active").removeClass("disable").addClass(this.options.future.length > 0 ? "active" : "disable");
  }
});
