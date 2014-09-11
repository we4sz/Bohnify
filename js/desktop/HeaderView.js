var HeaderView = Backbone.View.extend({
  events : {
    'click #headback.active' : 'back',
    'click #headfoward.active' : 'foward',
    'focusin #search' : 'focus',
    'focusout #search' : 'focusout',
    'keydown #search' : 'tabb',
    'setsearch' : 'setsearch',
    'input #search' : 'change'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.keydownlistener.bind(this));
    this.options.searchtimeout;
  },render : function(){
      var html =  " <div id='headback' class='active head'></div>"
                  + "<div id='headfoward' class='active head'></div>"
                  + " <input id='search' results=0 type='search' autocomplete='off' placeholder='Search'  class='head'/>";
      this.$el.html(html);
      return this;
  },change : function(){
    var val = this.$el.find("#search").val();
    if(this.options.oldval != val){
      this.options.oldval = val;
      clearTimeout(this.options.searchtimeout);
      if(val.length >= 1){
        this.options.searchtimeout = setTimeout(function(){
          this.options.ws.send({suggest : "spotify:"+val});
        }.bind(this),300);
      }else{
        $("#suggest").trigger("clear");
      }
    }
  },setsearch:function(_,data){
    this.$el.find("#search").val(data);
    this.change();
  },back : function(){
    window.history.back();
  },foward : function(){
    window.history.forward();
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
  },
   fixClasses : function(){
  //  this.$el.find("#headback").removeClass("disable").removeClass("active").addClass(this.options.history.length > 0 ? "active" : "disable");
  //  this.$el.find("#headfoward").removeClass("active").removeClass("disable").addClass(this.options.future.length > 0 ? "active" : "disable");
  }
});
