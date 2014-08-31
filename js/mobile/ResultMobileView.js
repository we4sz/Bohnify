var ResultMobileView = Backbone.View.extend({
  events : {
    'update' : 'update',
    'status' : 'newstatus',
    'backnext': 'backnext'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      if(this.options.data){
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          $("#header").trigger("settext",playlist.name);
          this.$el.html((new PlaylistMobileView({model : playlist, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse",this.options.data);
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "search"){
          $("#header").trigger("settext","SEARCH FOR: "+this.options.data.search);
          this.$el.html((new SearchMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse",this.options.data);
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "newsearch"){
          $("#header").trigger("settext","SEARCH");
          this.$el.html("");
        }else if(this.options.data.type == "album"){
          $("#header").trigger("settext",this.options.data.data.title);
          this.$el.html((new AlbumMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse",this.options.data);
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "artist"){
          $("#header").trigger("settext", this.options.data.data.name);
          this.$el.html((new ArtistMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse",this.options.data);
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "track"){
          $("#header").trigger("settext", this.options.data.data.title);
          this.$el.html((new AlbumMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse",this.options.data);
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "user"){

        }else if(this.options.data.type == "queue"){
          if($(".queueview").length == 0){
            $("#header").trigger("settext","QUEUE");
            this.$el.html((new QueueMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".queueview").trigger("newqueue",[this.options.data.data]);
          }
          if(!this.options.backnext){
            $("#header").trigger("addbrowse","queue");
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "toplist"){
          $("#header").trigger("settext","TOPLIST");
          this.$el.html((new ToplistMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse","toplist");
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "history"){
          if($(".historyview").length == 0){
            $("#header").trigger("settext","HISTORY");
            this.$el.html((new HistoryMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".historyview").trigger("newhistory",[this.options.data.data]);
          }
          if(!this.options.backnext){
            $("#header").trigger("addbrowse","history");
          }
          this.options.backnext = false;
        }else if(this.options.data.type == "load"){
          $("#header").trigger("settext","LOADING");
          var html = "<div class='resultloader'></div>";
          this.$el.html(html);
        }else if(this.options.data.type == "clear"){
          $("#header").trigger("settext","BOHNIFY");
          this.$el.html("");
        }else if(this.options.data.type == "mymusic"){
          $("#header").trigger("settext","YOUR MUSIC");
          this.$el.html((new MyMusicMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          if(!this.options.backnext){
            $("#header").trigger("addbrowse","mymusic");
          }
          this.options.backnext = false;
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
  },backnext: function(){
    this.options.backnext = true;
  }
});
