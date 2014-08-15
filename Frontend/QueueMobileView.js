var QueueMobileView = Backbone.View.extend({
  events :{
    'update' : 'update',
    'newqueue' : 'newqueue'
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    this.$el.addClass("queueview");
    this.$el.html("");
    this.options.standard = findWithAttr(this.model, "type", "standard");
    this.options.manual = findWithAttr(this.model, "type", "manual");
    this.options.vote = findWithAttr(this.model, "type", "vote");

    if(this.options.vote >= 0 && this.model[this.options.vote].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "VOTE QUEUE"})).render().$el);
      this.$el.append((new TracksMobileView({model: this.model[this.options.vote].queue, ws : this.options.ws,  extraclass: "votetrack"})).render().$el);
    }

    if(this.options.manual >= 0 && this.model[this.options.manual].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "MANUAL QUEUE"})).render().$el);
      this.$el.append((new TracksMobileView({model: this.model[this.options.manual].queue, ws : this.options.ws, extraclass: "manualtrack"})).render().$el);
    }

    if(this.options.standard >= 0 && this.model[this.options.standard].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "STANDARD QUEUE"})).render().$el);
      this.$el.append((new TracksMobileView({model: this.model[this.options.standard].queue, ws : this.options.ws, extraclass: "standardtrack"})).render().$el);
    }
    return this;
  }, update : function(){
    this.options.ws.send({getqueue : true});
  }, newqueue : function (_,queue){
    this.model = queue;
    var scroll = this.$el.scrollTop();
    this.render();
    this.$el.scrollTop(scroll);
  }
});
