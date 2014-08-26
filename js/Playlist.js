var Playlist = Backbone.Model.extend({
defaults : function(){
    return {
      tracks : [],
      name : "",
      collaborative : false,
      description : "",
      uri : ""
    }
  }
});
