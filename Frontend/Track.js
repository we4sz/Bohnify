var Track = Backbone.Model.extend({
defaults : function(){
    return {
      album : new Album(),
      artists: [],
      duration : 0,
      popularity : 0,
      title : "",
      uri : "",
      vote : 0
    }
  }
});
