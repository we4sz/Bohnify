var CreatedHead = Backbone.View.extend({
  events : {
    'click span' : 'browse'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var text = "";
    if(this.model.uri.indexOf(":track:")>=0){

    }else if(this.model.uri.indexOf(":artist:")>=0){

    }else if(this.model.uri.indexOf(":album:")>=0){
      this.options.uri = this.model.artist.uri;
      text = "By <span>"+this.model.artist.name+"</span> - "+this.model.year+" - "+this.model.tracks.length+" songs, "+getDurationOfTracks(this.model.tracks);
    }else if(this.model.uri.indexOf(":playlist:")>=0){
      this.options.uri = this.model.author.uri;
      text = "Created by: <span>"+this.model.author.nick+"</span> - "+this.model.tracks.length+" songs, "+getDurationOfTracks(this.model.tracks);
    }else if(this.model.uri.indexOf(":user:")>=0){

    }
    this.$el.addClass("createdhead");
    var html =  "<div class='createdheadtext'>"+text+"</div>";
    this.$el.append($.parseHTML(html));
    return this;
  }, browse : function(){
    if(this.options.uri){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : this.options.uri});
    }
  }
});
