var ArtistAlbumHeader = Backbone.View.extend({
  events : {
    'click .artistalbumname' : 'browse',
    'click .artistalbumplay' : 'play',
    'click .artistalbummenu' : 'menu'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var name = this.model.title;
    var text = this.model.year;
    if(this.model.cover){
      image = imageUrl(this.model.cover);
    }
    this.$el.addClass("artistalbumhead");
    var html =  "<img class='artistalbumimage' src='"+image+"'/>"
                + "<div class='artistalbumcon'>"
                + "<div class='artistalbumtext'>"+text+"</div></br>"
                + "<div class='artistalbumname'>"+name+"</div></br>"
                + "<button class='artistalbumplay'>Play</button>"
                + "<button class='artistalbummenu'>...</button>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    return this;
  },browse : function(){
    $("#result").trigger("update",{type: "load"});
    this.options.ws.send({search : "spotify:"+this.model.uri});
  }, play : function(){
    var tracks = this.model.tracks;
    tracks = tracks.map(function(t){
      return t.uri;
    });
    this.options.ws.send({startqueue : tracks})
  }, menu : function(ev){
    $("#contextmenu").remove();
    var x = ev.clientX;
    var y = ev.clientY;
    var html =  "<div id='contextmenu'>" +
                "<div id='contextplay' class='contextitem'>Play</div>" +
                "<div id='contextqueue' class='contextitem'>Queue</div>" +
                "<div id='contexturi' class='contextitem'>"+this.model.uri+"</div>" +
                "</div>";
    var el = $($.parseHTML(html));

    el.find("#contextqueue").click(function(ev){

      var tracks = this.model.tracks;
      tracks = tracks.map(function(t){
        return t.uri;
      });
      this.options.ws.send({standardqueue: tracks});
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
