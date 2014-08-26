var ToplistView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.html("");
    this.$el.addClass("toplistview");
    this.$el.append((new ArtistViewSeparator({model : "TOPLIST"})).render().$el);
    this.$el.append((new TracksView({model: this.model, ws : this.options.ws,  extraclass: "toplisttrack"})).render().$el);
    this.$el.find(".tracksview").trigger("passiveselectfirst");
    return this;
  }
});
