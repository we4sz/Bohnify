var ResultView = Backbone.View.extend({
  events : {
    'keyup' : 'test'
  },initialize : function (options) {
    this.options = options || {};
  },
  render : function(){
      this.$el.html("");
      if(this.options.data){
        if(this.options.data.type == "playlist"){
          var playlist = this.options.data.data;
          var self = this;
          _.each(playlist.get("tracks").toArray(), function(track, i) {
							self.$el.append((new TrackView({model: track})).render().$el);
					});
        }else if(this.options.data.type == "search"){


        }else if(this.options.data.type == "album"){


        }else if(this.options.data.type == "artist"){


        }else if(this.options.data.type == "track"){


        }else if(this.options.data.type == "user"){


        }else if(this.options.data.type == "load"){


        }
      }
      return this;
  },test : function(){
    alert("sd");
  }
});
