var ResultMobileView = Backbone.View.extend({
  events : {
    'update' : 'update',
    'status' : 'newstatus'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      if(this.options.data){
        console.log(this.options.data.type)
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          this.$el.html((new PlaylistView({model : playlist, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "search"){
          this.$el.html((new SearchMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "album"){
          this.$el.html((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "artist"){
          this.$el.html((new ArtistView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "track"){
          this.$el.html((new AlbumView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          $(".track").trigger("selecturi",this.options.data.search)
        }else if(this.options.data.type == "user"){

        }else if(this.options.data.type == "queue"){
          if($(".queueview").length == 0){
            this.$el.html((new QueueMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".queueview").trigger("newqueue",[this.options.data.data]);
          }
        }else if(this.options.data.type == "toplist"){
          this.$el.html((new ToplistMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
        }else if(this.options.data.type == "history"){
          if($(".historyview").length == 0){
            this.$el.html((new HistoryMobileView({model : this.options.data.data, ws:this.options.ws})).render().$el);
          }else{
            $(".historyview").trigger("newhistory",[this.options.data.data]);
          }
        }else if(this.options.data.type == "load"){
          var html = "<div class='resultloader'></div>";
          this.$el.html(html);
        }else if(this.options.data.type == "clear"){
          this.$el.html("");
        }else if(this.options.data.type == "mymusic"){
          this.$el.html((new MyMusicView({model : this.options.data.data, ws:this.options.ws})).render().$el);
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
  }
});
