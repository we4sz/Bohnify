var ResultMobileView = Backbone.View.extend({
  events : {
    'update' : 'update',
    'status' : 'newstatus',
    'play' : 'play'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      if(this.options.data){
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          $("#header").trigger("settext",playlist.name);
          window.currentview = playlist.uri;
          window.location.assign("#"+playlist.uri);
          this.$el.html((new PlaylistMobileView({model : playlist, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "search"){
          $("#header").trigger("settext","SEARCH FOR: "+this.options.data.search);
          window.currentview = this.options.data.search;
          window.location.assign("#spotify:search:"+this.options.data.search);
          this.$el.html((new SearchMobileView({model : this.options.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "newsearch"){
          $("#header").trigger("settext","SEARCH");
          this.$el.html("");
        }else if(this.options.data.type == "album"){
          $("#header").trigger("settext",this.options.data.data.title);
          window.currentview = this.options.data.data.uri;
          window.location.assign("#"+this.options.data.data.uri);
          this.$el.html((new AlbumMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "artist"){
          window.currentview = this.options.data.data.uri;
          window.location.assign("#"+this.options.data.data.uri);
          $("#header").trigger("settext", this.options.data.data.name);
          this.$el.html((new ArtistMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "track"){
          window.currentview = this.options.data.data.search;
          window.location.assign("#"+this.options.data.data.search);
          $("#header").trigger("settext", this.options.data.data.title);
          this.$el.html((new AlbumMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "user"){

        }else if(this.options.data.type == "queue"){
          if($(".queueview").length == 0){
            $("#header").trigger("settext","QUEUE");
            window.currentview = "spotify:queue";
            window.location.assign("#spotify:queue");
            this.$el.html((new QueueMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".queueview").trigger("newqueue",[this.options.data.data]);
          }
        }else if(this.options.data.type == "toplist"){
          $("#header").trigger("settext","TOPLIST");
          window.currentview = "spotify:toplist";
          window.location.assign("#spotify:toplist");
          this.$el.html((new ToplistMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "history"){
          if($(".historyview").length == 0){
            $("#header").trigger("settext","HISTORY");
            window.currentview = "spotify:history";
            window.location.assign("#spotify:history");
            this.$el.html((new HistoryMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".historyview").trigger("newhistory",[this.options.data.data]);
          }
        }else if(this.options.data.type == "load"){
          $("#header").trigger("settext","LOADING");
          var html = "<div class='resultloader'></div>";
          this.$el.html(html);
        }else if(this.options.data.type == "clear"){
          $("#header").trigger("settext","BOHNIFY");
          this.$el.html("");
        }else if(this.options.data.type == "mymusic"){
          $("#header").trigger("settext","YOUR MUSIC");
          window.currentview = "spotify:mymusic";
          window.location.assign("#spotify:mymusic");
          this.$el.html((new MyMusicMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }
      }
      if(this.options.status){
        this.$el.find(".track").trigger('markcurrent',[this.options.status]);
      }
      return this;
  },update : function(_,data) {
    if(this.options.data != data){
        this.options.data = data;
        this.render();
    }
  }, newstatus : function(_,status){
    this.options.status = status;
    if(this.options.status){
      this.$el.find(".track").trigger('markcurrent',[this.options.status]);
    }
  }, play : function(ev,context,index,dontplay){
      var start = true;
      if(dontplay){
        start = false;
      }
      var ob = {play : {uri: context,start:start}};
      if(index >=0){
        ob.play.track = index;
      }
      this.options.ws.send(ob);
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      return false;
  }
});
