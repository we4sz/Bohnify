var ToplistView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("playlistview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.get("tracks").length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>The playlist is currently empty</div>"));
      }else{
        this.$el.append((new TracksView({model: this.model.get("tracks"), ws : this.options.ws})).render().$el);
      }
      return this;
  }
});
