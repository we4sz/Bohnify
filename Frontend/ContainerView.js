var ContainerView = Backbone.View.extens({
  tagName: 'div',
  el: $("#bohnifycontainer"),
  render : function(){
      var html =  " <div id='logincon'>"
                  + "<form id='login'>"
                  + "<input id='username' type='text'/>"
                  + "<input id='password' type='text'/>"
                  + "<button>Login</button>"
                  + "</form>"
                  + "</div>";
      this.$el.html(html);
  }


});
