var HistoryView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("historyview");
      this.$el.append((new ArtistViewSeparator({model : "HISTORY"})).render().$el);
      this.$el.append((new TracksView({model: this.model, ws : this.options.ws,  extraclass: "historytrack"})).render().$el);
      return this;
  }
});
