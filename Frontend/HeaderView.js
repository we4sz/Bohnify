var HeaderView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headback' : 'back',
    'click #headfoward' : 'foward',
    'focusin #search' : 'focus',
    'keydown #search' : 'tabb'
  },initialize : function (options) {
    this.options = options || {};
    $(document).bind("keydown",this.takefocus.bind(this));
  },
  render : function(){
      var html =  " <div id='headback' class='disable head'></div>"
                  + "<div id='headfoward' class='disable head'></div>"
                  + " <input id='search' results=0 type='search' placeholder='Search'  class='head'/>";
      this.$el.html(html);
      return this;
  },
  search : function(){
    $("#result").trigger("update",{type: "load"});
    var val = this.$el.find("#search").val();
    this.options.ws.send(JSON.stringify({search : val}));
  },back : function(){

  },foward : function(){

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
          playlist.trigger("select",[true]);
        }else{
          var playlists = $(".playlist");
          if(playlists.length > 0){
            $(playlists.get(0)).trigger("select",[true]);
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
    }
  }
});
