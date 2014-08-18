var HeaderMobileView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headtext' : 'toggleleftmenu',
    'touchstart #headtext' : 'select',
    'touchend #headtext' : 'unselect',
    'addbrowse' : 'add',
    'focus #search' : 'focus',
    'searchfocus' : 'searchfocus',
    'blur #search' : 'blur',
    'searchunfocus' : 'searchunfocus',
    'settext' : 'settext'
  },initialize : function (options) {
    this.options = options || {};
    this.options.future = [];
    this.options.history = [];
    this.options.current;
  },
  render : function(){
      var html =  "<div id='headtext'>Bohnify</div>"
                  + " <input id='search' results=0 type='search' placeholder='Search'  class='head'/>";
      this.$el.html(html);
      return this;
  },
  search : function(ev){
    var val = this.$el.find("#search").val();
    this.$el.find("#search").blur();
    if(val){
      $("#leftmenu").trigger("selectsearch");
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : val});
    }
  },back : function(){
    this.options.future.push(this.options.current);
    this.options.current = this.options.history.pop();
    if(this.options.current.type === "playlist"){
      $(".playlistitem").trigger("selectfromuri",this.options.current.data);
    }else{
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(this.options.current,true);
    }
  },foward : function(){
    this.options.history.push(this.options.current);
    this.options.current = this.options.future.pop();
    if(this.options.current.type === "playlist"){
      $(".playlistitem").trigger("selectfromuri",this.options.current.data);
    }else if(this.options.current.type === "mymusic"){
      $("#mymusic").trigger("select",true);
    }else{
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send(this.options.current,true);
    }
    this.fixClasses();
  },add: function(_, command){
    var host = window.document.location.host.replace(/:.*/, '');

    if(this.options.current){
      this.options.history.push(this.options.current);
    }
    this.options.current = command;
    this.options.future = []
  },toggleleftmenu : function(){
    $("#leftmenu").trigger("toggle");
  }, focus : function(){
    $("#leftmenu").trigger("toggle",true);
  }, blur : function(){
    //$("#search").css("visibility","hidden");
  }, searchfocus : function(){
    $("#search").css("visibility","visible");
    $("#headtext").css("width","100px");
    $("#search").focus();
  }, searchunfocus: function(){
    $("#search").css("visibility","hidden");
    $("#headtext").css({"max-width": "calc(100% - 40px)",
                        "width" : ""});
    $("#search").blur();
  }, settext: function(_,text){
    this.$el.find("#headtext").html(text);
  }, select:function(){
    this.$el.find("#headtext").toggleClass("click");
  }, unselect:function(){
    this.$el.find("#headtext").removeClass("click");
  }

});
