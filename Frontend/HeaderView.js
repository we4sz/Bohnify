var HeaderView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headback' : 'back',
    'click #headfoward' : 'foward'
  },
  render : function(){
      var html =  " <div id='headback' class='disable head'></div>"
                  + "<div id='headfoward' class='disable head'></div>"
                  + " <input id='search' results=0 type='search' placeholder='Search'  class='head'/>";
      this.$el.html(html);
      return this;
  },
  search : function(){

  },back : function(){

  },foward : function(){

  }
});
