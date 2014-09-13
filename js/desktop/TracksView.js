var TracksView = Backbone.View.extend({
  events : {
    'resize' : 'setsize',
    "repainttracks" : "repaint",
    "passiveselectfirst" : "passiveselectfirst",
    "selectfirst" : "selectfirst"
  },
  tagName: 'div',
  initialize : function (options) {
    $(window).on("resize", this.setsize.bind(this));
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
    this.options.vote = window.lateststatus && window.lateststatus.party;
  },
  render : function(){
      this.$el.addClass("tracksview");
      this.options.sizes = [];
      var child =$(document.createElement("table"));

      if(this.options.header){

        var html ="<thead><tr><th class='trackindex'><span>#</span></th>";
        this.options.sizes.push({classname : "trackindex", size : "40px"});
        if(this.options.vote){
          html += "<th class='trackvote'><span>V</span></th>";
          this.options.sizes.push({classname : "trackvote", size : "40px"});
        }

        if(this.options.image){
          html += "<th class='trackimage'><span></span></th>";
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
          html += "<th class='trackduration'><span>TIME</span></th>";
          this.options.sizes.push({classname : "trackduration", size : "70px"});
        }
        if(this.options.album){
          html += "<th class='trackalbum'><span>ALBUM</span></th>";
          this.options.sizes.push({classname : "trackalbum", size : "20%"});
        }if(this.options.popularity){
          html += "<th class='trackpopularity'><span>Rank</span></th>";
          this.options.sizes.push({classname : "trackpopularity", size : "60px"});
        }
        html+="</tr></thead>";
        child.html(html);
      }
      child.append($.parseHTML("<tbody>"));
      _.each(this.model, function(track, i) {
        if(i<this.options.max){
          child.append((
            new TrackView({model: track,
              ws : this.options.ws,
              index:i,album : this.options.album,
              artist:this.options.artist,
              title:this.options.title,
              duration:this.options.duration,
              image:this.options.image,
              extraclass:this.options.extraclass,
              popularity:this.options.popularity,
              vote:this.options.vote})).render().$el);
          }
      }.bind(this));
      child.append($.parseHTML("</tbody></table>"));

      if(this.options.header){
        this.options.dt = child.dataTable( {
          dom : 't',
          paging : false,
          autoWidth : false,
          sScrollXInner : false
        });
      }

      child.bind("DOMNodeInsertedIntoDocument",this.setsize.bind(this));
      this.$el.append(child);
      return this;
  },setsize : function(sizes){
    var hw = 0;
    var ps = 0;

    this.options.sizes.forEach(function(size){
      if(size.size.indexOf("px")>0){
        var w = parseInt(size.size.substring(0,size.size.length-2));
        hw += w;
        this.$el.find("."+size.classname).css("width",size.size);
        //var s = $("."+size.classname).css("width");
      }else{
        var p = parseInt(size.size.substring(0,size.size.length-1));
        ps += p;
      }
    }.bind(this));

    var width = this.$el.parent().innerWidth();
    var scrollWidth = 12;
    var mw = width-scrollWidth-hw;
    var mul = 100/ps;
    this.options.sizes.forEach(function(size){
      if(size.size.indexOf("%")>0){
        var p = parseInt(size.size.substring(0,size.size.length-1))*mul*mw/100;
        var a = this.$el.find("."+size.classname);
        a.css("width",p+"px");
      }
    }.bind(this));
  }, repaint : function(){
    var selectIndex = $(".track.selected").index();
    this.options.vote = window.lateststatus && window.lateststatus.party;
    this.$el.find("table").DataTable().destroy(false);
    this.render();
    if(selectIndex >= 0){
      $(this.$el.find(".track").get(selectIndex)).trigger("select");
    }
  },passiveselectfirst: function(){
    $(this.$el.find(".track").get(0)).addClass("passiveselected");
  },selectfirst: function(){
    passiveSelectAll();
    $(this.$el.find(".track").get(0)).addClass("selected");
  }
});
