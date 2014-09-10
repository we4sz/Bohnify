var SearchSuggestMobileView = Backbone.View.extend({
  events : {
    'addsearch' : 'addsearch',
    'show' : 'show',
    'hide' : 'hide',
    'suggest' : 'suggest',
    'click .suggesttrack' : 'track',
    'click .suggestartist' : 'artist',
    'click .suggestalbum' : 'album',
    'clear' : 'clear',
    'status':'status',
    'play':'play'
  },initialize : function (options) {
    this.options = options || {};
    this.options.searches = [];
    this.render();
  },
  render : function(suggest){
    this.$el.html("");
    if(suggest){
      this.$el.append((new SuggestMobileItem({model : "Search for: "+$("#search").val(), ws : this.options.ws})).render().$el);

      if(suggest.tracks && suggest.tracks.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "TRACKS"})).render().$el);
        this.$el.append((new TracksMobileView({model : suggest.tracks, ws : this.options.ws})).render().$el);
      }
      if(suggest.albums && suggest.albums.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "ALBUMS"})).render().$el);
        suggest.albums.forEach(function(album){
          this.$el.append((new SuggestMobileItem({model : album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      if(suggest.artists && suggest.artists.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "ARTISTS"})).render().$el);
        suggest.artists.forEach(function(artist){
          this.$el.append((new SuggestMobileItem({model : artist, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      if(suggest.playlists && suggest.playlists.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "PLAYLISTS"})).render().$el);
        $.each(suggest.playlists,function(i,playlist){
          this.$el.append((new SuggestMobileItem({model : playlist, ws : this.options.ws})).render().$el);
          return i < 2;
        }.bind(this));
      }
    }else{
      if(this.options.searches.length > 0){
        this.$el.append((new ArtistViewSeparator({model : "Recent Searches"})).render().$el);
        $.each(this.options.searches, function(i,search){
          this.$el.append((new SuggestMobileItem({model : search, ws : this.options.ws})).render().$el);
          return i < 9;
        }.bind(this));
      }else{
        this.$el.append((new ArtistViewSeparator({model : "No Recent Searches"})).render().$el);
      }
    }

    if(this.options.status){
      this.$el.find(".track").trigger('markcurrent',[this.options.status]);
    }
    return this;
  },addsearch: function(_,data){
    this.options.searches.push(data);
    this.render(this.options.last);
  },show: function(){
    this.$el.css("display","inline");
  }, hide: function(){
    this.$el.css("display","none");
  }, suggest: function(_, data){
    this.render(data);
    this.options.last = data;
  }, clear: function(){
    this.render();
    this.options.last = null;
  }, status: function(_, status){
    this.options.status = status;
    if(this.options.status){
      this.$el.find(".track").trigger('markcurrent',[this.options.status]);
    }
  },
  play : function(ev,context,index,dontplay){
    $("#result").trigger("play",[context,index,dontplay])
  }
});
