var SearchView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("searchview");
      this.$el.append((new TracksView({model: this.model.data, ws : this.options.ws, extraclass: "searchtrack"})).render().$el);
      this.$el.find(".tracksview").trigger("selectfirst");
      return this;
  }
});
