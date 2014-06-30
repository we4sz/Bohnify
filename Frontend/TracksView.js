var TracksView = Backbone.View.extend({
  events : {
    'play': 'play',
    'mousedown th' : 'resize',
    'mousemove th' : 'fixcursor',
    'mousemove' : 'fixresize',
    'mouseup' : 'stopresize',
    'resize' : 'setresize'
  },
  tagName: 'table',
  initialize : function (options) {
    $(window).on("resize", this.setresize.bind(this));
    this.options = options || {};

    this.options.title = typeof options.title !== 'undefined' ? options.title : true;
    this.options.artist = typeof options.artist !== 'undefined' ? options.artist : true;
    this.options.album= typeof options.album !== 'undefined' ? options.album : true;
    this.options.extraclass = typeof options.extraclass !== 'undefined' ? options.extraclass : "";
    this.options.duration = typeof options.duration !== 'undefined' ? options.duration : true;
    this.options.image = typeof options.image !== 'undefined' ? options.image : false;
    this.options.popularity = typeof options.popularity !== 'undefined' ? options.popularity : true;
    this.options.header = typeof options.header !== 'undefined' ? options.header : true;
    this.options.max = typeof options.max !== 'undefined' ? options.max : 100000;
  },
  render : function(){
      this.$el.addClass("tracksview");
      this.options.sizes = [];
      if(this.options.header){

        var html ="<thead><tr><th class='trackindex'><span>#</span></th>";
        this.options.sizes.push({classname : "trackindex", size : "40px"});
        if(this.options.image){
          html += "<th class='trackimage resizable-false'><span></span></th>";
          this.options.sizes.push({classname : "trackimage", size : "40px"});
        }
        if(this.options.title){
          html += "<th class='tracktitle' width='100'><span>SONG</span></th>";
          this.options.sizes.push({classname : "tracktitle", size : "30%"});
        }
        if(this.options.artist){
          html += "<th class='trackartists'><span>ARTIST</span></th>";
          this.options.sizes.push({classname : "trackartists", size : "25%"});
        }
        if(this.options.duration){
          html += "<th class='trackduration resizable-false'><span>TIME</span></th>";
          this.options.sizes.push({classname : "trackduration", size : "70px"});
        }
        if(this.options.album){
          html += "<th class='trackalbum'><span>ALBUM</span></th>";
          this.options.sizes.push({classname : "trackalbum", size : "20%"});
        }if(this.options.popularity){
          html += "<th class='trackpopularity resizable-false'><span>Rank</span></th>";
          this.options.sizes.push({classname : "trackpopularity", size : "60px"});
        }
        html+="</tr></thead>";
        this.$el.html(html);
      }
      this.$el.append($.parseHTML("<tbody>"));
      _.each(this.model.toArray(), function(track, i) {
        if(i<this.options.max){
          this.$el.append((
            new TrackView({model: track,
              ws : this.options.ws,
              index:i,album : this.options.album,
              artist:this.options.artist,
              title:this.options.title,
              duration:this.options.duration,
              image:this.options.image,
              extraclass:this.options.extraclass,
              popularity:this.options.popularity})).render().$el);
          }
      }.bind(this));
      this.$el.append($.parseHTML("</tbody></table>"));
      if(this.options.header){
        this.$el.dataTable( {
          dom : 't',
          paging : false,
          autoWidth : false,
          sScrollXInner : false
        });
      }

      this.$el.bind("DOMNodeInsertedIntoDocument",this.setsize.bind(this));

      return this;
  },play : function(_,index){
    var tracks = this.model.toJSON();
    var track = tracks[index].uri;
    tracks.splice(index,1);
    tracks = tracks.map(function(t){
      return t.uri;
    });
    var ob = JSON.stringify({play : {track : track,queue:tracks}});
    this.options.ws.send(ob);
  }, fixresize:function(ev){
    if(this.options.resize){
      var next = $(this.options.nextclass);
      var curr = $(this.options.class);
      var w = curr.innerWidth()-2;
      var d = ev.screenX - this.options.startx;
      this.options.startx = ev.screenX;
      var nw = w + d;
      var nextw = next.innerWidth() -2 -d;
      if(nextw > this.options.nextwidth && nw > this.options.currwidth && nextw > 40 && nw > 40){
        $(this.options.nextclass).css("width",(nextw+"px"));
        $(this.options.class).css("width",(nw+"px"));
      }
    }
  },fixcursor: function(ev){
    if(!this.options.resize){
      var target = $(ev.target);
      if(target.is("th")){
        var w = target.outerWidth();
        var ox = ev.offsetX;
        if(ox > w - 5){
          $("#result").css("cursor","ew-resize");
        }else{
          $("#result").css("cursor","");
        }
      }
    }
  },resize:function(ev){
    if($(ev.target).css("cursor") == "ew-resize"){
      this.options.resize = true;
      this.options.startx = ev.screenX;
      $(ev.target).attr("class").split(" ").forEach(function(cl){
          if(cl.indexOf("track")>=0){
            this.options.class = "."+cl;
          }
      }.bind(this));
      $("th"+this.options.class).next().attr("class").split(" ").forEach(function(cl){
          if(cl.indexOf("track")>=0){
            this.options.nextclass = "."+cl;
          }
      }.bind(this))
      this.options.nextwidth = $("th"+this.options.nextclass).textWidth() + 30;
      this.options.currwidth = $("th"+this.options.class).textWidth() + 30;
    }else{
      this.options.resize = false;
    }
    return false;
  },stopresize : function(ev){
    this.options.resize = false;
    $("#result").css("cursor","");
    return false;
  },setsize : function(sizes){
    var hw = 0;
    var ps = 0;
    this.options.sizes.forEach(function(size){
      if(size.size.indexOf("px")>0){
        var w = parseInt(size.size.substring(0,size.size.length-2));
        hw += w;
        this.$el.find("."+size.classname).css("width",size.size);
        var s = $("."+size.classname).css("width");
      }else{
        var p = parseInt(size.size.substring(0,size.size.length-1));
        ps += p;
      }
    }.bind(this));
    this.options.width = this.$el.parent().innerWidth();
    var mw = this.options.width-12-hw;
    var mul = 100/ps;
    this.options.sizes.forEach(function(size){
      if(size.size.indexOf("%")>0){
        var p = parseInt(size.size.substring(0,size.size.length-1))*mul*mw/100;
        var a = this.$el.find("."+size.classname);
        a.css("width",p+"px");
      }
    }.bind(this));
  },setresize : function(ev){
    if(this.$el.parent().innerWidth() != this.options.width){
      var w = this.$el.parent().innerWidth();
      this.options.sizes.forEach(function(size){
        var a = this.$el.find("."+size.classname).innerWidth()/w;
        size.size = (a*100)+"%";
      }.bind(this));
    }
    this.setsize();
  }
});
