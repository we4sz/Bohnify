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
    this.options.ws.send({getqueue : true});
  }, newqueue : function (_,queue){
    var index = -1;
    var passive = false;
    var tracks = $(".track");
    tracks.each(function(i){
      if($( this ).hasClass("selected")){
        index = i;
        return false;
      }else if($( this ).hasClass("passiveselected")){
        index = i;
        passive = true;
        return false;
      }
    })

    var scroll = $("#result").scrollTop();
    this.model = queue;
    this.render();
    tracks = $(".track");
    if(index >= 0){
      if(tracks.length > index){
        $(tracks.get(index)).trigger(passive ? "passiveselect" : "select");
      }else if(tracks.length > 0){
        $(tracks.get(tracks.length -1)).trigger(passive ? "passiveselect" : "select");
      }else{
        $(".playlistitem.passiveselected").trigger("makeselect");
      }
    }else if(tracks.length > 0){
      $(tracks.get(0)).trigger(passive ? "passiveselect" : "select");
    }
    $("#result").scrollTop(scroll);
  }, delete : function(){
    var selectedTrack = $(".track.selected");
    if(selectedTrack){
      var track = null;
        if(selectedTrack.hasClass("manualtrack")){
          track = this.model[this.options.manual].queue[selectedTrack.index()];
        }else if(selectedTrack.hasClass("standardtrack")){
          track = this.model[this.options.standard].queue[selectedTrack.index()];
        }else if(selectedTrack.hasClass("votetrack")){
          track = this.model[this.options.vote].queue[selectedTrack.index()];
        }
        if(track){
          this.options.ws.send({removeFromQueue : [{context:track.context, index:track.origindex}]});
        }
    }
  }
});
