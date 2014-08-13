var HeaderMobileView = Backbone.View.extend({
  events : {
    'search' : 'search',
    'click #headtext' : 'toggleleftmenu',
    'addbrowse' : 'add'
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
    if(val){
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
  }

});
