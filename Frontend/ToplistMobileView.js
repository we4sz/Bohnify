var ToplistMobileView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.html("");
    this.$el.addClass("toplistview");
    this.$el.append((new TracksMobileView({model: this.model, ws : this.options.ws,  extraclass: "toplisttrack"})).render().$el);
    return this;
  }
});
