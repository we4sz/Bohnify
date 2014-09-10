var TracksMobileView = Backbone.View.extend({
  events : {
    "repainttracks" : "repaint"
  },
  initialize : function (options) {
    this.options = options || {};
    this.options.extraclass = typeof options.extraclass !== 'undefined' ? options.extraclass : "";
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("tracksview");
      this.model.forEach(function(track, i) {
        if(!this.options.max || (this.options.max && this.options.max > i)){
          this.$el.append((new TrackMobileView({model: track, index: i, ws: this.options.ws, extraclass: this.options.extraclass})).render().$el);
        }
      }.bind(this));
      return this;
  }, repaint : function(){
    var scroll = this.$el.scrollTop();
    this.render();
    this.$el.scrollTop(scroll);
  }
});
