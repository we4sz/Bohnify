var QueueView = Backbone.View.extend({
  events :{
    'update' : 'update',
    'newqueue' : 'newqueue',
    "delete" : "delete"
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
      this.$el.append((new TracksView({model: this.model[this.options.vote].queue, ws : this.options.ws,  extraclass: "votetrack"})).render().$el);
    }

    if(this.options.manual >= 0 && this.model[this.options.manual].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "MANUAL QUEUE"})).render().$el);
      this.$el.append((new TracksView({model: this.model[this.options.manual].queue, ws : this.options.ws, extraclass: "manualtrack"})).render().$el);
    }

    if(this.options.standard >= 0 && this.model[this.options.standard].queue.length > 0){
      this.$el.append((new ArtistViewSeparator({model : "STANDARD QUEUE"})).render().$el);
      this.$el.append((new TracksView({model: this.model[this.options.standard].queue, ws : this.options.ws, extraclass: "standardtrack"})).render().$el);
    }
    $(this.$el.find(".tracksview").get(0)).trigger("passiveselectfirst");
    return this;
  }, update : function(){
    var selectedTrack = $(".track.selected");
    if(selectedTrack){
        if(selectedTrack.hasClass("manualtrack")){
          this.options.selected = {hasclass : "manualtrack", track : this.model[this.options.manual].queue.at(selectedTrack.index())};
        }else if(selectedTrack.hasClass("standardtrack")){
          this.options.selected = {hasclass : "standardtrack", track : this.model[this.options.standard].queue.at(selectedTrack.index())};
        }else if(selectedTrack.hasClass("votetrack")){
          this.options.selected = {hasclass : "votetrack", track : this.model[this.options.vote].queue.at(selectedTrack.index())};
        }
    }
    this.options.ws.send({getqueue : true});
  }, newqueue : function (_,queue){
    this.model = queue;
    this.render();
    if(this.options.selected && this.options.selected.track){
      $(".track."+this.options.selected.hasclass).trigger("selecturi",this.options.selected.track.uri);
      if($(".track.selected").length == 0){
        $("#queue").trigger("select");
      }
    }
  }, delete : function(){
    var selectedTrack = $(".track.selected");
    if(selectedTrack){
        if(selectedTrack.hasClass("manualtrack")){
          track = this.model[this.options.manual].queue.at(selectedTrack.index());
          this.options.ws.send({removemanualqueue : [track.uri]});
        }else if(selectedTrack.hasClass("standardtrack")){
          track = this.model[this.options.standard].queue.at(selectedTrack.index());
          this.options.ws.send({removestandardqueue : [track.uri]});
        }else if(selectedTrack.hasClass("votetrack")){
          track = this.model[this.options.vote].queue.at(selectedTrack.index());
          this.options.ws.send({removemanualqueue : [track.uri]});
        }
    }
  }
});
