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
    'settext' : 'settext',
    'click #headback.active': 'back',
    'click #headfoward.active': 'foward',

  },initialize : function (options) {
    this.options = options || {};
    this.options.future = [];
    this.options.history = [];
    this.options.current;
  },
  render : function(){
      var html =  "<div id='headtext'>Bohnify</div>"
                  + "<input id='search' results=0 type='search' placeholder='Search'  class='head'/>"
                  + "<div id='headback' class='disable'></div>"
                  + "<div id='headfoward' class='disable'></div>";
      this.$el.html(html);
      return this;
  },
  search : function(ev){
    var val = this.$el.find("#search").val();
    this.$el.find("#search").blur();
    if(val){
      $("#leftmenu").trigger("selectsearch");
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({search : "spotify:"+val});
    }
  },back : function(){
    this.options.future.push(this.options.current);
    this.options.current = this.options.history.pop();
    $("#result").trigger("backnext");
    if(this.options.current == "mymusic"){
      $("#menuhome").click();
    }else if(this.options.current == "toplist"){
      $("#menutoplist").click();
    }else if(this.options.current == "queue"){
      $("#menuqueue").click();
    }else if(this.options.current == "history"){
      $("#menuhistory").click();
    }else{
      if(this.options.current.type=="playlist"){
        $(".playlistitem").trigger("selectfromuri",this.options.current.data);
      }
      $("#result").trigger("update",this.options.current);
    }
    this.fixClasses();
  },foward : function(){
    this.options.history.push(this.options.current);
    this.options.current = this.options.future.pop();
    $("#result").trigger("backnext");
    if(this.options.current == "mymusic"){
      $("#menuhome").click();
    }else if(this.options.current == "toplist"){
      $("#menutoplist").click();
    }else if(this.options.current == "queue"){
      $("#menuqueue").click();
    }else if(this.options.current == "history"){
      $("#menuhistory").click();
    }else{
      if(this.options.current.type=="playlist"){
        $(".playlistitem").trigger("selectfromuri",this.options.current.data);
      }
      $("#result").trigger("update",this.options.current);
    }
    this.fixClasses();
  },add: function(_, command){
    if(this.options.current){
      this.options.history.push(this.options.current);
    }
    this.options.current = command;
    this.options.future = [];
    this.fixClasses();
    console.log(this.options.history)
  },toggleleftmenu : function(){
    $("#leftmenu").trigger("toggle");
  }, focus : function(){
    $("#leftmenu").trigger("toggle",true);
  }, blur : function(){
    //$("#search").css("visibility","hidden");
  }, searchfocus : function(){
    $("#search").css("visibility","visible");
    $("#headtext").css("width","80px");
    $("#search").focus();
  }, searchunfocus: function(){
    $("#search").css("visibility","hidden");
    $("#headtext").css({"max-width": "calc(100% - 120px)",
                        "width" : ""});
    $("#search").blur();
  }, settext: function(_,text){
    this.$el.find("#headtext").html(text);
  }, select:function(){
    this.$el.find("#headtext").toggleClass("click");
  }, unselect:function(){
    this.$el.find("#headtext").removeClass("click");
  }, fixClasses : function(){
    this.$el.find("#headback").removeClass("disable").removeClass("active").addClass(this.options.history.length > 0 ? "active" : "disable");
    this.$el.find("#headfoward").removeClass("active").removeClass("disable").addClass(this.options.future.length > 0 ? "active" : "disable");
  }

});
