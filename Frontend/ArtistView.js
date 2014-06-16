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
      _.each(this.model.get("albums").toArray(), function(album, i) {
        if(album.get("type") == 0 ){
          albums.push(album);
        }else if(album.get("type") == 1 ){
          singles.push(album);
        }else if(album.get("type") == 2 ){
          compilations.push(album);
        }else if(album.get("type") == 3 ){
          appears.push(album);
        }
      });

      albums.sort(function(a,b){
        return b.get("year")-a.get("year");
      })

      singles.sort(function(a,b){
        return b.get("year")-a.get("year");
      })

      compilations.sort(function(a,b){
        return b.get("year")-a.get("year");
      })

      appears.sort(function(a,b){
        return b.get("year")-a.get("year");
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

      if(appears.length>0){
        this.$el.append((new ArtistViewSeparator({model : "APPEARS ON"})).render().$el);
        _.each(appears,function(album, i) {
            this.$el.append((new ArtistAlbumView({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }

      return this;
  },show : function(_,notChange){

  }
});
