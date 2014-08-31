var SearchSuggestView = Backbone.View.extend({
  events : {
    'addsearch' : 'addsearch',
    'show' : 'show',
    'hide' : 'hide',
    'suggest' : 'suggest',
    'click .suggesttrack' : 'track',
    'click .suggestartist' : 'artist',
    'click .suggestalbum' : 'album',
    'clear' : 'clear'
  },initialize : function (options) {
    this.options = options || {};
    this.options.searches = [];
    this.render();
    $(document).bind("keydown",this.keydownlistener.bind(this));
  },
  render : function(suggest){
    this.$el.html("");
    if(suggest){
      this.$el.append((new SuggestItem({model : "Search for: "+$("#search").val(), ws : this.options.ws})).render().$el);

      if(suggest.tracks && suggest.tracks.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "TRACKS"})).render().$el);
        suggest.tracks.forEach(function(track){
          this.$el.append((new SuggestItem({model : track, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      if(suggest.albums && suggest.albums.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "ALBUMS"})).render().$el);
        suggest.albums.forEach(function(album){
          this.$el.append((new SuggestItem({model : album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      if(suggest.artists && suggest.artists.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "ARTISTS"})).render().$el);
        suggest.artists.forEach(function(artist){
          this.$el.append((new SuggestItem({model : artist, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      if(suggest.playlists && suggest.playlists.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "PLAYLISTS"})).render().$el);
        $.each(suggest.playlists,function(i,playlist){
          this.$el.append((new SuggestItem({model : playlist, ws : this.options.ws})).render().$el);
          return i < 2;
        }.bind(this));
      }
    }else{
      if(this.options.searches.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "Recent Searches"})).render().$el);
        $.each(this.options.searches, function(i,search){
          this.$el.append((new SuggestItem({model : search, ws : this.options.ws})).render().$el);
          return i < 9;
        }.bind(this));
      }else{
        this.$el.append((new ArtistViewSeparator({model : "No Recent Searches"})).render().$el);
      }
    }

    $($(".suggestitem").get(0)).addClass("selected");
    return this;
  },addsearch: function(_,data){
    this.options.searches.push(data);
    this.render(this.options.last);
  },show: function(){
    this.$el.css("visibility","visible");
  }, hide: function(){
    this.$el.css("visibility","hidden");
  }, suggest: function(_, data){
    this.render(data);
    this.options.last = data;
  }, up: function(){
    var index = this.getselectedindex();
    if(index > 0 ){
      this.deselect();
      $($(".suggestitem").get(index-1)).addClass("selected");
    }
  }, down: function(){
    var index = this.getselectedindex();
    if(index < $(".suggestitem").length-1){
      this.deselect();
      $($(".suggestitem").get(index+1)).addClass("selected");
    }
  },startselected: function(){
    $(".suggestitem.selected").trigger("enter");
  },getselectedindex: function(){
    var index = -1;
    $(".suggestitem").each(function(i){
      if($(this).hasClass("selected")){
        index = i;
      }
    });
    return index;
  },deselect:function(){
    $(".suggestitem.selected").removeClass("selected");
  },keydownlistener: function(ev){
    if(this.$el.css("visibility") == "visible"){
      if(ev.keyCode == 38){
        this.up();
      }else if(ev.keyCode == 40){
        this.down();
      }else if(ev.keyCode == 13){
        this.startselected();
      }
    }
  }, clear: function(){
    this.render();
    this.options.last = null;
  }
});
