var HeaderMobileView = Backbone.View.extend({
  events : {
    'search #search' : 'search',
    'click #headtext' : 'toggleleftmenu',
    'touchstart #headtext' : 'select',
    'touchend #headtext' : 'unselect',
    'addbrowse' : 'add',
    'focus #search' : 'focus',
    'focusin #search' : 'focus',
    'searchfocus' : 'searchfocus',
    'blur #search' : 'blur',
    'searchunfocus' : 'searchunfocus',
    'settext' : 'settext',
    'click #headback.active': 'back',
    'click #headfoward.active': 'foward',
    'input #search':'change',
    'setsearch' : 'setsearch'
  },initialize : function (options) {
    this.options = options || {};
    this.options.future = [];
    this.options.history = [];
    this.options.current;
    this.options.searchtimeout;
    //$(document).bind("keyup",this.keyuplistener.bind(this));
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
    this.$el.find("#search").blur();
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
  },toggleleftmenu : function(){
    $("#leftmenu").trigger("toggle");
  }, focus : function(){
    $("#leftmenu").trigger("toggle",true);
    $("#search").css("visibility","visible");
    $("#suggest").trigger("show");
  }, blur : function(){
    //$("#search").css("visibility","hidden");
  }, searchfocus : function(){
    $("#search").css("visibility","visible");
    $("#headtext").css("width","80px");
    $("#search").focus();
    $("#suggest").trigger("show");
  }, searchunfocus: function(){
    $("#search").css("visibility","hidden");
    $("#headtext").css({"max-width": "calc(100% - 120px)", "width" : ""});
    $("#search").blur();
    $("#suggest").trigger("hide");
  }, settext: function(_,text){
    this.$el.find("#headtext").html(text);
  }, select:function(){
    this.$el.find("#headtext").toggleClass("click");
  }, unselect:function(){
    this.$el.find("#headtext").removeClass("click");
  }, fixClasses : function(){
    this.$el.find("#headback").removeClass("disable").removeClass("active").addClass(this.options.history.length > 0 ? "active" : "disable");
    this.$el.find("#headfoward").removeClass("active").removeClass("disable").addClass(this.options.future.length > 0 ? "active" : "disable");
  }, change: function(){
    var val = this.$el.find("#search").val();
    if(this.options.oldval != val){
      this.options.oldval = val;
      clearTimeout(this.options.searchtimeout);
      if(val.length >= 1){
        this.options.searchtimeout = setTimeout(function(){
          this.options.ws.send({suggest : "spotify:"+val});
        }.bind(this),300);
      }else{
        $("#suggest").trigger("clear");
      }
    }
  },setsearch:function(_,data){
    this.$el.find("#search").val(data);
    this.change();
  }

});
