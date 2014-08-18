var LeftMobileMenu = Backbone.View.extend({
  events : {
    'toggle' : 'toggle',
    'click #menuqueue' :  'getqueue',
    'click #menuhistory' :  'gethistory',
    'click #menuhome' :  'gethome',
    'click #menusearch' :  'getsearch',
    'click #menutoplist' :  'gettoplist',
    'newcon' :  'newcon',
    'selectsearch' : 'selectsearch'
  },
  initialize: function(options) {
      this.options = options || {};
  },
  render: function() {
      this.$el.html(
                  "<div class='menuitem' id='menusearch'><div class='name'>Search</div></div>" +
                  "<div class='menuitem' id='menuhome'><div class='name'>Your music</div></div>" +
                  "<div class='menuitem' id='menutoplist'><div class='name'>Toplist</div></div>" +
                  "<div class='menuitem' id='menuqueue'><div class='name'>Queue</div></div>" +
                  "<div class='menuitem' id='menuhistory'><div class='name'>History</div></div>");
      return this;
  },toggle : function(_, remove, search){
    if(this.$el.hasClass("wide") || remove){
      this.$el.removeClass("wide");
    }else{
      this.$el.addClass("wide");
    }
  },getqueue : function(){
    this.select("#menuqueue",true);
    if($(".queueview").length == 0 ){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({getqueue : true});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
  },gethistory : function(){
    this.select("#menuhistory");
    if($(".historyview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gethistory : true});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
  },gettoplist : function(){
    this.select("#menutoplist");
    if($(".toplistview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gettoplist : true});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
  },gethome : function(){
    this.select("#menuhome");
    if($(".mymusicview").length == 0){
      $("#result").trigger("update",{type: "mymusic", data:this.options.con});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
    $("#header").trigger("addbrowse",{type: "mymusic"});
  },getsearch : function(){
    this.select("#menusearch");
    this.toggle(false,true);
    $("#search").trigger("searchfocus");
    $("#header").trigger("settext","SEARCH");
  }, select : function(target,first,passive){
    $(".menuitem.selected").removeClass("selected");
    $(".menuitem.passiveselected").removeClass("passiveselected");
    $(target).addClass("selected");
  }, selectsearch : function(){
    this.select("#menusearch");
  }, newcon : function(_,con){
    this.options.con = con;
    if(!this.options.first){
      $("#menuhome").click();
      this.options.first = true;
    }
  }
});
