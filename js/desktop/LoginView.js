var LoginView = Backbone.View.extend({
  events : {
    'submit' : 'login',
    'keypress input' : 'keypress'
  },initialize : function (options) {
    this.options = options || {};
    this.options.un = "";
    this.options.pass = "";
  },
  render : function(){
      var html = "";
      if(this.options.loginstatus.logingin){
        html =    "<div id='logincon'>"
                  + "<div id='logindiv'>"
                  + "<div id='loginimage'></div>"
                  + "<div id='logintext'>Bohnify</div>"
                  + "<form id='loginprogress'>"
                  + "</div>"
                  + "</div>";
      }else if(this.options.loginstatus.loginerror){
        html =    "<div id='logincon'>"
                  + "<div id='logindiv'>"
                  + "<div id='loginimage'></div>"
                  + "<div id='logintext'>Bohnify</div>"
                  + "<div id='loginerror'>"+ this.options.loginstatus.loginerror +"</div>"
                  + "<form id='loginform'>"
                  + "<input type='text' id='loginusername' placeholder='Username' value='"+this.options.un+"'/>"
                  + "<input type='password' id='loginpassword' placeholder='Password' value='"+this.options.pass+"'/>"
                  + "<button id='loginbutton'>LOG IN</button>"
                  + "</form>"
                  + "</div>"
                  + "</div>";
      }else{
        html =     "<div id='logincon'>"
                  + "<div id='logindiv'>"
                  + "<div id='loginimage'></div>"
                  + "<div id='logintext'>Bohnify</div>"
                  + "<form id='loginform'>"
                  + "<input type='text' id='loginusername' placeholder='Username' value='"+this.options.un+"'/>"
                  + "<input type='password' id='loginpassword' placeholder='Password' value='"+this.options.pass+"'/>"
                  + "<button id='loginbutton'>LOG IN</button>"
                  + "</form>"
                  + "</div>"
                  + "</div>";
      }
      this.$el.html(html);
      this.$el.find("#loginusername").focus();
      return this;
  },login : function(){
    var un = this.$el.find("#loginusername").val();
    var pass = this.$el.find("#loginpassword").val();
    this.options.ws.send({login : {username: un , password: pass}});
    return false;
  },keypress : function(){
    this.options.pass = this.$el.find("#loginpassword").val();
    this.options.un = this.$el.find("#loginusername").val();;
  },remove : function(){
      this.$el.html("");
  }
});
