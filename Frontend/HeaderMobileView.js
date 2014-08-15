var HeaderMobileView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headtext' : 'toggleleftmenu',
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
  },add: function(_, command){
    if(this.options.current){
      this.options.history.push(this.options.current);
    }
    this.options.current = command;
    this.options.future = []
  },toggleleftmenu : function(){
    this.options.blink = setTimeout(this.removeblink.bind(this),300);
    this.$el.find("#headtext").css("background-color","#333437");
    $("#leftmenu").trigger("toggle");
  },removeblink : function(){
    this.$el.find("#headtext").css("background-color","transparent");
  }, focus : function(){
    $("#leftmenu").trigger("toggle",true);
  }, blur : function(){
    //$("#search").css("visibility","hidden");
  }, searchfocus : function(){
    $("#search").css("visibility","visible");
    $("#search").focus();
  }, searchunfocus: function(){
    $("#search").css("visibility","hidden");
    $("#search").blur();
  }, settext: function(_,text){
    this.$el.find("#headtext").html(text);
  }

});
