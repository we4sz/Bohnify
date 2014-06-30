var QueueView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.addClass("queueview");
    var standard = findWithAttr(this.model, "type", "standard");
    var manual = findWithAttr(this.model, "type", "manual");
    var vote = findWithAttr(this.model, "type", "vote");

    if(vote >= 0 && this.model[vote].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "VOTE QUEUE"})).render().$el);
      this.$el.append((new TracksView({model: this.model[vote].queue, ws : this.options.ws,  extraclass: "votetrack"})).render().$el);
    }

    if(manual >= 0 && this.model[manual].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "MANUAL QUEUE"})).render().$el);
      this.$el.append((new TracksView({model: this.model[manual].queue, ws : this.options.ws, extraclass: "manualtrack"})).render().$el);
    }

    if(standard >= 0 && this.model[standard].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "STANDARD QUEUE"})).render().$el);
      this.$el.append((new TracksView({model: this.model[standard].queue, ws : this.options.ws, extraclass: "standardtrack"})).render().$el);
    }
    return this;
  }
});
