var TrackView = Backbone.View.extend({
  events : {
    'dblclick' : 'play',
    'click' : 'select',
    'select' : 'select',
    'playtrack': 'play',
    'click .trackalbumtext' : 'browsealbum',
    'markcurrent' : 'currenttrack',
    'click .trackartist' : 'browseartist',
    'contextmenu' : 'opencontext',
    'selecturi' : 'selecturi',
    'votechange' : 'votechange',
    "passiveselect" : "passiveselect"
  },initialize : function (options) {
    this.options = options || {};
    this.options.title =  options.title;
    this.options.artist =  options.artist;
    this.options.album=  options.album;
    this.options.duration =  options.duration;
    this.options.extraclass =  options.extraclass;
    this.options.image =  options.image;
    this.options.popularity =  options.popularity;
    this.options.vote =  options.vote;
  },tagName: "tr",
  render : function(){
    var artists = "";
    this.$el.addClass("track");
    this.$el.addClass(this.options.extraclass);
    _.each(this.model.artists, function(artist, i) {
        artists += "<span class='trackartist'>"+artist.name+"</span><span class='trackartistsseparator'>,&nbsp;</span>";
    });
    artists = artists.substring(0,artists.length-50);
    var html ="<td><div class='trackindex'>"+(this.options.index+1)+"</div></td>";
    if(this.options.vote){
      html += "<td><div class='resize trackvote'>"+this.model.vote+"</div></td>";
    }
    if(this.options.image){
      var image = imageUrl(this.model.album.cover);
      html += "<td><div class='resize trackimage'><img src='"+image+"'/></td>";
    }
    if(this.options.title){
      html += "<td><div class='resize tracktitle'>"+this.model.title+"</div></td>";
    }
    if(this.options.artist){
      html += "<td><div class='resize trackartists'>"+artists+"</div></td>";
    }
    if(this.options.duration){
      html += "<td><div class='trackduration'>"+toMinutesAndSeconds(this.model.duration/1000)+"</div></td>";
    }
    if(this.options.album){
      html += "<td><div class='resize trackalbum'><span class='trackalbumtext'>"+this.model.album.title+"</span></div></td>";
    }
    if(this.options.popularity){
      html += "<td><div class='trackpopularity'>"+this.model.popularity+"</div></td>";
    }
    this.$el.html(html);
    return this;
  },play : function(){
    this.$el.parent().trigger("play",[this.options.index]);
  },select: function(){
    $(".track.selected").removeClass("selected");
    $(".track.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    var first = $(".track")[0] == this.$el[0];
    takeInFocus($("#result"),this.$el,first);
  },passiveselect : function() {
    $(".track.selected").removeClass("selected");
    $(".track.passiveselected").removeClass("passiveselected");
    this.$el.addClass("passiveselected");
  },browsealbum : function(){
    $("#result").trigger("update",{type: "load"});
    var ob = {search : this.model.album.uri};
    this.options.ws.send(ob);
  },browseartist : function(e){
    $("#result").trigger("update",{type: "load"});
    var index = parseInt($(e.target).index()/2);
    var uri = this.model.artists[index].uri;
    var ob = {search : uri};
    this.options.ws.send(ob);
  }, currenttrack : function(_,status){
    if(status.track){
      if(status.track.uri == this.model.uri){
        this.$el.addClass("current");
        this.$el.find(".trackvote").html(status.track.vote);
      }else{
        this.$el.removeClass("current");
      }
    }
  }, votechange : function(_,vote){
    if(vote && vote.uri && vote.vote){
      if(vote.uri == this.model.uri){
        this.$el.find(".trackvote").html(vote.vote);
      }
    }
  }, opencontext : function(ev){
    this.select();
    $("#contextmenu").remove();
    var x = ev.clientX;
    var y = ev.clientY;
    var html =  "<div id='contextmenu'>" +
                "<div id='contextqueue' class='contextitem'>Queue track</div>" +
                "<div id='contexttrackuri' class='contextitem'>"+this.model.uri+"</div>" +
                "<div id='contextartisturi' class='contextitem'>"+this.model.artists[0].uri+"</div>" +
                "<div id='contextalbumuri' class='contextitem'>"+this.model.album.uri+"</div>" +
                "</div>";
    var el = $($.parseHTML(html));

    el.find("#contextqueue").click(function(ev){
      this.options.ws.send({manualqueue: [this.model.uri]});
      el.remove();
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
  }, selecturi : function(_,uri){
    if(this.model.uri == uri) {
      this.select();
    }
  }
});
