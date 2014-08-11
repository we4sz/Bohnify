var ArtistAppearsView = Backbone.View.extend({
  events : {
    'click .artistappearsimage' : 'browse',
    'click .artistappearsname' : 'browse'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
    var image = "/images/playlistdefault.png";
    var name = this.model.get("title");
    var text = this.model.get("year");
    if(this.model.get("cover")){
      image = imageUrl(this.model.get("cover"));
    }
    this.$el.addClass("artistappearsview");
    var html =    "<img class='artistappearsimage' src='"+image+"'/>"
                + "<div class='artistappearstextcon'>"
                + "<div class='artistappearsname'>"+name+"</div>"
                + "<div class='artistappearstext'>"+text+"</div>"
                + "</div>";

    this.$el.append($.parseHTML(html));
    return this;
  },browse : function(){
    $("#result").trigger("update",{type: "load"});
    this.options.ws.send({search : this.model.get("uri")});
  }
});
