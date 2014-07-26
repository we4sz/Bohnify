var SearchView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("searchview");
      this.$el.append((new TracksView({model: this.model, ws : this.options.ws})).render().$el);
      this.$el.find(".tracksview").trigger("passiveselectfirst");
      return this;
  }
});
