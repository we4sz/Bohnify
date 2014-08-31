var HeaderView = Backbone.View.extend({
  events : {
    'click #headback.active' : 'back',
    'click #headfoward.active' : 'foward',
    'focusin #search' : 'focus',
    'focusout #search' : 'focusout',
    'keydown #search' : 'tabb',
    'setsearch' : 'setsearch',
    'addbrowse' : 'add'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.keydownlistener.bind(this));
    $(document).bind("keyup",this.keyuplistener.bind(this));
    this.options.future = [];
    this.options.history = [];
    this.options.current;
    this.options.searchtimeout;
  },render : function(){
      var html =  " <div id='headback' class='disable head'></div>"
                  + "<div id='headfoward' class='disable head'></div>"
                  + " <input id='search' results=0 type='search' autocomplete='off' placeholder='Search'  class='head'/>";
      this.$el.html(html);
      return this;
  },search : function(ev){
    var val = this.$el.find("#search").val();
    if(val){
      $("#suggest").trigger("addsearch",val);
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : "spotify:"+val});
    }
  },change : function(val){
    clearTimeout(this.options.searchtimeout);
    if(val.length >= 1){
      this.options.searchtimeout = setTimeout(function(){
        this.options.ws.send({suggest : "spotify:"+val});
      }.bind(this),300);
    }else{
      $("#suggest").trigger("clear");
    }
  },setsearch:function(_,data){
    this.$el.find("#search").val(data);
    this.options.ws.send({suggest : "spotify:"+data});
  },back : function(){
    this.options.future.push(this.options.current);
    this.options.current = this.options.history.pop();
    $("#result").trigger("backnext");
    if(this.options.current == "mymusic"){
      $("#mymusic").click();
    }else if(this.options.current == "toplist"){
      $("#toplist").click();
    }else if(this.options.current == "queue"){
      $("#queue").click();
    }else if(this.options.current == "history"){
      $("#history").click();
    }else{
      if(this.options.current.type=="playlist"){
        $(".playlistitem").trigger("selectfromuri",this.options.current.data);
      }
      $("#result").trigger("update",this.options.current);
    }
    this.fixClasses();
  },foward : function(){
    this.options.history.push(this.options.current);
    this.options.current = this.options.future.pop();
    $("#result").trigger("backnext");
    if(this.options.current == "mymusic"){
      $("#mymusic").click();
    }else if(this.options.current == "toplist"){
      $("#toplist").click();
    }else if(this.options.current == "queue"){
      $("#queue").click();
    }else if(this.options.current == "history"){
      $("#history").click();
    }else{
      if(this.options.current.type=="playlist"){
        $(".playlistitem").trigger("selectfromuri",this.options.current.data);
      }
      $("#result").trigger("update",this.options.current);
    }
    this.fixClasses();
  },focus : function(){
    passiveSelectAll();
    this.$el.find("#search").select();
    $("#suggest").trigger("show");
    var val = this.$el.find("#search").val();
    if(val.length >= 1){
      this.options.ws.send({suggest : "spotify:"+val});
    }else{
      $("#suggest").trigger("clear");
    }
  },focusout : function(){
    $("#suggest").trigger("hide");
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

  },keydownlistener : function(ev){
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
  },keyuplistener : function(ev){
    if(this.$el.find("#search").is(":focus")){
      var val = this.$el.find("#search").val();
      if(this.options.oldval != val){
        this.options.oldval = val;
        this.change(val);
      }
    }
  }, add: function(_, command){
    if(this.options.current){
      this.options.history.push(this.options.current);
    }
    this.options.current = command;
    this.options.future = [];
    this.fixClasses();
  }, fixClasses : function(){
    this.$el.find("#headback").removeClass("disable").removeClass("active").addClass(this.options.history.length > 0 ? "active" : "disable");
    this.$el.find("#headfoward").removeClass("active").removeClass("disable").addClass(this.options.future.length > 0 ? "active" : "disable");
  }
});
