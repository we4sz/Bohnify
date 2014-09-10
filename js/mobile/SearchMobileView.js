var SearchMobileView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("searchview");
      this.$el.append((new TracksMobileView({model: this.model.data, ws : this.options.ws, extraclass: "searchtrack"})).render().$el);
      return this;
  }
});
