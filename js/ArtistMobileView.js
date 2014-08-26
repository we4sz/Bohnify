var ArtistMobileView = Backbone.View.extend({
  events : {
    'click #artistrelated' : 'related',
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.addClass("artistview");
      //this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
    this.$el.append((new ArtistViewSeparator({model : "POPULAR"})).render().$el);
    this.$el.append((new TracksMobileView({model: this.model.toptracks, ws : this.options.ws,artist:false,album:false,image:true,max:5})).render().$el);

    this.$el.append((new ArtistViewSeparator({model : "RELATED ARTISTS"})).render().$el);
    var similar = "";
    this.model.similar.forEach(function(artist, i) {
        similar = similar + artist.name;
        if(i < this.model.similar.length -1){
          similar =  similar + ", ";
        }
    }.bind(this));

    this.$el.append($.parseHTML("<div id='artistrelated'><p>"+similar+"</p></div>"));





      var singles = [];
      var albums = [];
      this.model.albums.forEach(function(album, i) {
        if(album.type == 0 ){
          albums.push(album);
        }else if(album.type == 1 ){
          singles.push(album);
        }
      });

      albums.sort(function(a,b){
        return b.year-a.year;
      })

      singles.sort(function(a,b){
        return b.year-a.year;
      })

      var albumsdiv = $($.parseHTML("<div id='artistalbums' class='artistalbumcon'></div>"));

       if(albums.length>0){
        this.$el.append((new ArtistViewSeparator({model : "ALBUMS"})).render().$el);
        _.each(albums, function(album, i) {
          albumsdiv.append((new AlbumMobileCard({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }

      this.$el.append(albumsdiv);

      var singlesdiv = $($.parseHTML("<div id='artistsingles' class='artistalbumcon'></div>"));

      if(singles.length>0){
        this.$el.append((new ArtistViewSeparator({model : "SINGLES"})).render().$el);
        _.each(singles, function(album, i) {
          singlesdiv.append((new AlbumMobileCard({model: album, ws : this.options.ws})).render().$el);
        }.bind(this));
      }




      this.$el.append(singlesdiv);
      return this;
  },related : function(){
    var el = this.$el.find("#artistrelated");
    var el2 = this.$el.find("#artistrelated p");
    this.options.blink = setTimeout(function(){
      el.removeClass("click");
      el2.removeClass("click");
    }.bind(this),300);
    el.toggleClass("click");
    el2.toggleClass("click");
  }
});
