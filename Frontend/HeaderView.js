var HeaderView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headback' : 'back',
    'click #headfoward' : 'foward'
  },
  render : function(){
      var html =  " <div id='headback'></div>"
                  + "<div id='headfoward'></div>"
                  + " <input id='search' results=0 type='search' placeholder='Search'/>";
      this.$el.html(html);
      return this;
  },
  search : function(){

  },back : function(){

  },foward : function(){

  }
});
