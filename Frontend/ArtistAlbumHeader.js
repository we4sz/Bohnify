var ArtistAlbumHeader = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var name = this.model.get("title");
    var text = this.model.get("year");
    if(this.model.get("cover")){
      image = imageUrl(this.model.get("cover"));
    }
    this.$el.addClass("artistalbumhead");
    var html =  "<img class='artistalbumimage' src='"+image+"'/>"
                + "<div class='artistalbumcon'>"
                + "<div class='artistalbumtext'>"+text+"</div>"
                + "<div class='artistalbumname'>"+name+"</div>"
                + "<button class='artistalbumplay'>Play</button>"
                + "<button class='artistalbummenu'>...</button>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    return this;
  },show : function(_,notChange){

  }
});
