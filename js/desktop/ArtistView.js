var ArtistView = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.addClass("artistview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);

      this.$el.append((new ArtistTopView({model : this.model, ws:this.options.ws})).render().$el);

      var singles = [];
      var albums = [];
      var appears = [];
      var compilations = [];
      var others = [];
      this.model.albums.forEach(function(album, i) {
        if(album.type == 0 ){
          albums.push(album);
        }else if(album.type == 1 ){
          singles.push(album);
        }else if(album.type == 2 ){
          compilations.push(album);
        }else if(album.type == 3 ){
          others.push(album);
        }else if(album.type == 4 ){
          appears.push(album);
        }
      });

      albums.sort(function(a,b){
        return b.year-a.year;
      })

      singles.sort(function(a,b){
        return b.year-a.year;
      })

      others.sort(function(a,b){
        return b.year-a.year;
      })

      compilations.sort(function(a,b){
        return b.year-a.year;
      })

      appears.sort(function(a,b){
        return b.year-a.year;
      })
      if(albums.length>0){
        this.$el.append((new ArtistViewSeparator({model : "ALBUMS"})).render().$el);
        _.each(albums, function(album, i) {
            this.$el.append((new ArtistAlbumView({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      if(singles.length>0){
        this.$el.append((new ArtistViewSeparator({model : "SINGLES"})).render().$el);
        _.each(singles, function(album, i) {
            this.$el.append((new ArtistAlbumView({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }

      if(compilations.length>0){
        this.$el.append((new ArtistViewSeparator({model : "COMPILATIONS"})).render().$el);
        _.each(compilations,function(album, i) {
            this.$el.append((new ArtistAlbumView({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }

      if(others.length>0){
        this.$el.append((new ArtistViewSeparator({model : "OTHERS"})).render().$el);
        _.each(others,function(album, i) {
            this.$el.append((new ArtistAlbumView({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }

      if(appears.length>0){
        this.$el.append((new ArtistViewSeparator({model : "APPEARS ON"})).render().$el);
        _.each(appears,function(album, i) {
            this.$el.append((new ArtistAppearsView({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }
      $(this.$el.find(".tracksview").get(0)).trigger("selectfirst");
      return this;
  },show : function(_,notChange){

  }
});
