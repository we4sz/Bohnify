var MyMusicMobileView = Backbone.View.extend({
  events :{
    "click #mymusicplaylists" : "getplaylists",
    "click #mymusicsongs" : "getsongs",
    "click #mymusicalbums" : "getalbums",
    "click #mymusicartists" : "getartists"
  },
  initialize : function (options) {
    this.options = options || {};
    this.options.selected = "playlists";
  },
  render : function(){
    this.$el.addClass("mymusicview");
    this.$el.html(
        "<table id='mymusicheader'>"
      + "<td id='mymusicplaylists' class='mymusictab'><div>PLAYLISTS</div></td>"
    //  + "<td id='mymusicsongs' class='mymusictab'><div>SONGS</div></td>"
    //  + "<td id='mymusicalbums' class='mymusictab'><div>ALBUMS</div></td>"
    //  + "<td id='mymusicartists' class='mymusictab'><div>ARTISTS</div></td>"
      + "</table><div id='mymusiccon'></div>"
    );

/*
    this.model.forEach(function(pl){
      if(!pl.playlists){
        this.$el.append((new PlaylistCard({model: pl, ws: this.options.ws})).render().$el);
      }
    }.bind(this));*/
    this.select(this.$el.find("#mymusicplaylists"));
    return this;
  }, getplaylists : function(){
    this.select($("#mymusicplaylists"));
  }, getsongs : function(){
    this.select($("#mymusicsongs"));
  }, getalbums : function(){
    this.select($("#mymusicalbums"));
  }, getartists : function(){
    this.select($("#mymusicartists"));
  }, select : function(el){
    $(".tabselected").removeClass("tabselected");
    el.addClass("tabselected");

    var parent = this.$el.find("#mymusiccon");
    parent.html("");
    if(el[0].id == "mymusicplaylists"){
      this.model.forEach(function(pl){
        parent.append((new PlaylistMobileItem({model: pl, ws: this.options.ws})).render().$el);
      }.bind(this));
    }else if(el[0].id == "mymusicsongs"){

    }else if(el[0].id == "mymusicalbums"){

    }else if(el[0].id == "mymusicartists"){

    }
  }
});
