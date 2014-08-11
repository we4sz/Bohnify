var PlaylistView = Backbone.View.extend({
  events : {
    "update" : "update"
  },
  initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.html("");
      this.$el.addClass("playlistview");
      this.$el.append((new BrowseHeader({model : this.model, ws:this.options.ws})).render().$el);
      if(this.model.get("tracks").length==0){
        this.$el.append($.parseHTML("<div class='playlistempty'>The playlist is currently empty</div>"));
      }else{
        this.$el.append((new TracksView({model: this.model.get("tracks"), ws : this.options.ws,  extraclass: "playlisttrack"})).render().$el);
      }
      this.$el.find(".tracksview").trigger("passiveselectfirst");
      return this;
  }, update : function(_,pl){
    if(this.model.get("uri") == pl.get("uri")){
      var selected = $(".track.selected").index();
      var passive = $(".track.passiveselected").index();
      var scroll = $("#result").scrollTop();
      this.model = pl;
      this.render();
      if(selected >= 0 && selected < this.model.get("tracks").length){
        $(this.$el.find(".track").get(selected)).trigger("select");
      }else if(passive >= 0 && passive < this.model.get("tracks").length){
        $(this.$el.find(".track").get(passive)).trigger("passiveselect");
      }else if(selected){
        this.$el.find(".tracksview").trigger("select");
      }else{
        this.$el.find(".tracksview").trigger("passiveselectfirst");
      }

      $("#result").scrollTop(scroll);
    }
  }
});
