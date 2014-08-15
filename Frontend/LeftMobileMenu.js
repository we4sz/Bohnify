var LeftMobileMenu = Backbone.View.extend({
  events : {
    'toggle' : 'toggle',
    'click #menuqueue' :  'getqueue',
    'click #menuhistory' :  'gethistory',
    'click #menuhome' :  'gethome',
    'click #menusearch' :  'getsearch',
    'click #menutoplist' :  'gettoplist',
    'selectsearch' : 'selectsearch'
  },
  initialize: function(options) {
      this.options = options || {};
  },
  render: function() {
      this.$el.html(
                  "<div class='menuitem' id='menusearch'><div class='name'>Search</div></div>" +
                  "<div class='menuitem selected' id='menuhome'><div class='name'>Your music</div></div>" +
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
    this.toggle();
  },gethistory : function(){
    this.select("#menuhistory");
    if($(".historyview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gethistory : true});
    }
    this.toggle();
  },gettoplist : function(){
    this.select("#menutoplist");
    if($(".toplistview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gettoplist : true});
    }
    this.toggle();
  },gethome : function(){
    this.select("#menuhome");
    if($(".toplistview").length == 0){
      $("#result").trigger("update",{type: "mymusic"});
    }
    this.toggle();
  },getsearch : function(){
    this.select("#menusearch");
    this.toggle();
    $("#search").trigger("searchfocus");
  }, select : function(target,first,passive){
    $(".menuitem.selected").removeClass("selected");
    $(".menuitem.passiveselected").removeClass("passiveselected");
    $(target).addClass("selected");
  }, selectsearch : function(){
    this.select("#menusearch");
  }
});
