var PlaylistItem = Backbone.View.extend({
  events : {
    'click .playlistfolder' : 'expand',
    'click .playlist' : 'show',
    'select': 'show',
    'expand' : 'expand',
    'play' : 'play',
    'dblclick .playlist' : 'play',
    'contextmenu .playlist' : 'opencontext'
  },initialize : function (options) {
    this.options = options || {};
    this.options.data = {type: "playlist", data:this.model};
    this.options.isbig = false;
  },
  render : function(){
    this.$el.addClass("playlistitem");
    var folderclass = this.model.get("playlists") ? (this.options.isbig ? "playlistfolder" : "playlistfolder") : "playlist";
    var imageclass = this.model.get("playlists") ? (this.options.isbig ? "folderminimize" : "foldermaximize") : "playlistnote";

    var html = $.parseHTML("<div class='"+folderclass+"'><div class='"+imageclass+"'></div>"
          + "<div class='playlistname'>"+this.model.get("name")+"</div></div>");
        this.$el.html(html);
    if(this.options.isbig){
      _.each(this.model.get("playlists"), function(playlist, i) {
          this.$el.append((new PlaylistItem({model: playlist, ws : this.options.ws, index:i})).render().$el);
      }.bind(this));
    }
    return this;
  },show : function(_,notChange){
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
    if(!notChange && this.$el.find(".playlistfolder").length == 0){
      $("#result").trigger("update",[this.options.data]);
    }
  },click : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
  },expand : function(){
    this.options.isbig = !this.options.isbig;
    this.render();
    $(".playlistitem.selected").removeClass("selected");
    $(".playlistitem.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus($("#leftmenu"),this.$el);
  },play : function(ev){
    if(this.$el.find(".playlistfolder").length > 0){
      this.expand();
    }else{
      var tracks = this.model.get("tracks").toJSON();
      tracks = tracks.map(function(t){
        return t.uri;
      });
      var ob = JSON.stringify({startqueue : tracks});
      this.options.ws.send(ob);
      return false;
    }
  }, opencontext : function(ev){
    $("#contextmenu").remove();
    var x = ev.clientX;
    var y = ev.clientY;
    var html =  "<div id='contextmenu'>" +
                "<div id='contextplay' class='contextitem'>Play</div>" +
                "<div id='contextqueue' class='contextitem'>Choose as Current Playlist</div>" +
                "<div id='contexturi' class='contextitem'>"+this.model.get("uri")+"</div>" +
                "</div>";
    var el = $($.parseHTML(html));

    el.find("#contextqueue").click(function(ev){
      var tracks = this.model.get("tracks").toJSON();
      tracks = tracks.map(function(t){
        return t.uri;
      });
      this.options.ws.send(JSON.stringify({standardqueue: tracks}));
      el.remove();
    }.bind(this));

    el.find("#contextplay").click(function(ev){
      this.play();
      $("#contextmenu").remove();
    }.bind(this));


    $(document.body).append(el);

    var h = el[0].clientHeight;
    var w = el[0].clientWidth;
    var mw = $(window).innerWidth();
    var mh = $(window).innerHeight();

    if(y + h > mh){
      el.css('top',(y-h)+"px");
    }else{
      el.css('top',y+"px");
    }

    if(x+w>mw){
      el.css('left',(x-w)+"px");
    }else{
      el.css('left',x+"px");
    }
    return false;
  }
});
