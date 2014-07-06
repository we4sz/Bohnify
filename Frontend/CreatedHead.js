var CreatedHead = Backbone.View.extend({
  events : {
    'click span' : 'browse'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var text = "";
    if(this.model instanceof Track){

    }else if(this.model instanceof Artist){

    }else if(this.model instanceof Album){
      this.options.uri = this.model.get("artists").at(0).get("uri");
      text = "By <span>"+this.model.get("artists").at(0).get("name")+"</span> - "+this.model.get("year")+" - "+this.model.get("tracks").length+" songs, "+getDurationOfTracks(this.model.get("tracks"));
    }else if(this.model instanceof Playlist){
      //this.options.uri = this.model.get("author").get("uri");
      text = "Created by: <span>"+this.model.get("author").get("nick")+"</span> - "+this.model.get("tracks").length+" songs, "+getDurationOfTracks(this.model.get("tracks"));
    }else if(this.model instanceof User){

    }
    this.$el.addClass("createdhead");
    var html =  "<div class='createdheadtext'>"+text+"</div>";
    this.$el.append($.parseHTML(html));
    return this;
  }, browse : function(){
    if(this.options.uri){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(JSON.stringify({search : this.options.uri}));
    }
  }
});
