var TrackMobileView = Backbone.View.extend({
  events : {
    'click' : 'play',
    'click .trackmenu' : 'opencontext',
    'contextmenu' : 'opencontext',
    'markcurrent' : 'currenttrack',
    'votechange' : 'votechange',
    'touchstart' : 'select',
    'touchend' : 'unselect'
  },initialize : function (options) {
    this.options = options || {};
    this.options.extraclass =  options.extraclass;
  },
  render : function(){
    var artists = "";
    var html = "";
    this.$el.addClass("track");
    this.$el.addClass(this.options.extraclass);
    this.model.artists.forEach(function(artist, i) {
        artists += artist.name+",&nbsp;";
    });
    artists = artists.substring(0,artists.length-7);
    if(window.lateststatus.party){
      html += "<div class='trackvote'>"+this.model.vote+"</div>";
    }
    html += "<div class='tracktext'>";
    html += "<div class='tracktitle'>"+this.model.title+"</div>";
    html += "<div class='trackartistsalbum'>"+artists+" &#8226; "+this.model.album.title+"</div>"
    html += "</div>";
    html += "<div class='trackmenu'></div>";
    this.$el.html(html);
    return this;
  },play : function(){
    this.$el.parent().trigger("play",[this.model.context, this.model.origindex]);
  },browsealbum : function(){
    $("#result").trigger("update",{type: "load"});
    var ob = {search : "spotify:"+this.model.album.uri};
    this.options.ws.send(ob);
  },browseartist : function(e){
    $("#result").trigger("update",{type: "load"});
    var index = parseInt($(e.target).index()/2);
    var uri = this.model.artists[index].uri;
    var ob = {search : "spotify:"+uri};
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
    var add = $("#contextmenu").length == 0;
    $("#contextmenu").remove();
    if(add){
      var html =  "<div id='contextmenu'>" +
                  "<div id='contextqueue' class='contextitem'>Queue</div>" +
                  "<div id='contextartist' class='contextitem'>Artist</div>" +
                  "<div id='contextalbum' class='contextitem'>Album</div>" +
                  "</div>";
      var el = $($.parseHTML(html));

      el.find("#contextqueue").click(function(ev){
        this.options.ws.send({manualqueue: {context:this.model.context,indices:[this.model.origindex]}});
        el.remove();
      }.bind(this));

      el.find(".contextitem").on("touchstart",function(){
        $(this).css("background-color","#575757");
      });

      el.find("#contextartist").click(function(ev){
        $("#suggest").trigger("hide");
        $("#leftmenu").trigger("deselect");
        $("#header").trigger("searchunfocus");
        $("#result").trigger("update",{type: "load"});
        this.options.ws.send({search : "spotify:"+this.model.artists[0].uri});
        el.remove();
      }.bind(this));

      el.find("#contextalbum").click(function(ev){
        $("#suggest").trigger("hide");
        $("#leftmenu").trigger("deselect");
        $("#header").trigger("searchunfocus");
        $("#result").trigger("update",{type: "load"});
        this.options.ws.send({search : "spotify:"+this.model.album.uri});
        el.remove();
      }.bind(this));


      $(document.body).append(el);
      var h = el.find(".contextitem").outerHeight();
      el.css('height',(h*el.find(".contextitem").length)+"px");
      return false;
    }
  }, select:function(){
    this.$el.toggleClass("click");
  }, unselect:function(){
    this.$el.removeClass("click");
  }
});
