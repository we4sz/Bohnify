var LeftMobileMenu = Backbone.View.extend({
  events : {
    'toggle' : 'toggle',
    'click #menuqueue' :  'getqueue',
    'click #menuhistory' :  'gethistory',
    'click #menuhome' :  'gethome',
    'click #menusearch' :  'getsearch',
    'click #menutoplist' :  'gettoplist',
    'newcon' :  'newcon',
    'selectsearch' : 'selectsearch',
    'touchstart .menuitem' : 'clickselect',
    'touchend .menuitem' : 'clickunselect',
    'click #leftmenuoverflow' : 'toggle',
    'update': 'update'
  },
  initialize: function(options) {
      this.options = options || {};
  },
  render: function() {
      this.$el.html(
                  "<div id='leftmenumenu'>" +
                  "<div class='menuitem' id='menusearch'><div class='name'>Search</div></div>" +
                  "<div class='menuitem' id='menuhome'><div class='name'>Your music</div></div>" +
                  "<div class='menuitem' id='menutoplist'><div class='name'>Toplist</div></div>" +
                  "<div class='menuitem' id='menuqueue'><div class='name'>Queue</div></div>" +
                  "<div class='menuitem' id='menuhistory'><div class='name'>History</div></div>" +
                  "</div>" +
                  "<div id='leftmenuoverflow'></div>"
                  );
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
    return false;
  },gethistory : function(){
    this.select("#menuhistory");
    if($(".historyview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gethistory : true});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
    return false;
  },gettoplist : function(){
    this.select("#menutoplist");
    if($(".toplistview").length == 0){
      $("#result").trigger("update",{type: "load"});
      this.options.ws.send({gettoplist : true});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
    return false;
  },gethome : function(){
    this.select("#menuhome");
    if($(".mymusicview").length == 0){
      $("#result").trigger("update",{type: "mymusic", data:this.options.con});
    }
    this.toggle(false,true);
    $("#search").trigger("searchunfocus");
    return false;
  },getsearch : function(){
    this.select("#menusearch");
    this.toggle(false,true);
    if($(".searchview").length == 0){
      $("#search").trigger("searchfocus");
      $("#result").trigger("update",{type: "newsearch"});
    }
    return false;
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
  }, clickselect:function(ev){
    var el = $(ev.target);
    while(!el.hasClass("menuitem")){
      el = $(el.parent());
    }
    this.options.touched = el;
    el.toggleClass("click");
  }, clickunselect:function(){
    $(this.options.touched).removeClass("click");
  }, update: function(asd,pl){
    function loop(con){
      for(var i = 0; i<con.length;i++){
        var playlist = con[i];
        if(playlist.playlists){
          if(loop(playlist.playlists)){
            break;
          }
        }else{
          if(playlist.uri == pl.uri){
            con[i] = pl;
            return true;
          }
        }
      };
    }
    loop(this.options.con);
    return false;
  }
});
