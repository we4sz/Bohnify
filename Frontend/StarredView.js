var StarredView = Backbone.View.extend({
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.addClass("starredview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.get("tracks").length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>No starred tracks</div>"));
      }else{
        this.$el.append((new TracksView({model: this.model.get("tracks"), ws : this.options.ws,  extraclass: "starredtrack"})).render().$el);
      }
      this.$el.find(".tracksview").trigger("passiveselectfirst");
      return this;
  }
});
