var ArtistSimilarItem = Backbone.View.extend({
  events : {
    'click' : 'search',
  },initialize : function (options) {
    this.options = options || {};
    this.options.data = {type: "playlist", data:this.model};
  },
  render : function(){
    this.$el.addClass("artistsimilaritem");
    var image = "/images/similarimage.png";
    var cover = this.model.portrait;
    if(cover){
      image = imageUrl(cover);
    }
    var html =  "<img class='artistsimilarimage' src='"+image+"'/>"
                + "<div class='artistsimilarname'>"+this.model.name+"</div>";
    this.$el.html(html);
    return this;
  },show : function(_,notChange){
    $(".playlist.selected").removeClass("selected");
    $(".playlist.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus(this.$el.parent(),this.$el);
    if(!notChange){
      $("#result").trigger("update",[this.options.data]);
    }
  },search: function(){
    $("#result").trigger("update",{type: "load"});
    this.options.ws.send({search : this.model.uri});
  }
});
