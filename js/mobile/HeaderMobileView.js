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
                  + "<div id='headback' class='active'></div>"
                  + "<div id='headfoward' class='active'></div>";
      this.$el.html(html);
      return this;
  },
  search : function(ev){
    this.$el.find("#search").blur();
  },back : function(){
    window.history.back();
  },foward : function(){
    window.history.forward();
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
