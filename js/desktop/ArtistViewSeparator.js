var ArtistViewSeparator = Backbone.View.extend({
  render : function(){
    this.$el.addClass("artistseparator");
    this.$el.html("<div class='artistseparatortext'>"+this.model+"</div>");
    return this;
  }
});
