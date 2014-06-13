var ArtistView = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
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
        return a.get("year")-b.get("year");
      })

      singles.sort(function(a,b){
        return a.get("year")-b.get("year");
      })

      compilations.sort(function(a,b){
        return a.get("year")-b.get("year");
      })

      appears.sort(function(a,b){
        return a.get("year")-b.get("year");
      })
      console.log(albums.length);
      var self =this;
      _.each(albums, function(album, i) {
          self.$el.append((new ArtistAlbumView({model: album, ws : self.options.ws})).render().$el);
      });
      return this;
  },show : function(_,notChange){

  }
});
