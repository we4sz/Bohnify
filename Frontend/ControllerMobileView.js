var ControllerMobileView = Backbone.View.extend({
  events : {
    'input #controllvolume' : 'volume',
    'click #controllprev' : 'prev',
    'click #controllpause' : 'pause',
    'click #controllnext' : 'next',
    'click #controllshuffle' : 'shuffle',
    'click #controllrepeat' : 'repeat',
    'click #controllparty' : 'party',
    'input #controllposition' : 'position',
    'status' : 'update',
    'touchstart #controllposition' : 'disablepos',
    'touchend #controllposition' : 'activatepos',
    'touchstart #controllvolume' : 'disablevol',
    'touchend #controllvolume' : 'activatevol',
    'show' : 'show',
    'click #controllexit' : 'close'
  },initialize : function (options) {
    this.options = options || {};
    this.options.position = true;
    this.options.volume = true;
  },
  render : function(){
      var html =  "<div id='controlllayer'></div>"
                  + "<div class='controlltop'>"
                  + "<div id='controllexit'></div>"
                  + "</div>"
                  + "<img id='controlltrackimage' src='/images/playlistdefault.png'/>"
                  + "<div class='controllbottom'>"
                  + "<div class='controllbottomleft'>"
                  + "<div id='controllparty' class='disable controller'></div>"
                  + "<div id='controlltime' class='controller'>00:00</div>"
                  + "<div id='controllshuffle' class='disable controller'></div>"
                  + "<div id='controllrepeat' class='disable controller'></div>"
                  + "</div>"
                  + "<div class='controllbottommiddle'>"
                  + "<div id='controlltrackname'></div>"
                  + "<div id='controlltrackartists'></div>"
                  + "<input id='controllposition' min='0' max='100' value='0' type='range' class='controller'/>"
                  + "<div class='controllplayback'>"
                  + "<div id='controllprev' class='disable controller'></div>"
                  + "<div id='controllpause' class='active controller'></div>"
                  + "<div id='controllnext' class='disable controller'></div>"
                  + "</div>"
                  + "</div>"
                  + "<div class='controllbottomright'>"
                  + "<div id='controllmenu'></div>"
                  + "<div id='controllduration' class='controller'>00:00</div>"
                  + "<div id='controllvolume'></div>"
                  + "</div>"
                  + "</div>";
      this.$el.html(html);
      return this;
  },volume : function(){
    var s = $("#controllvolume");
    var val = ($(s).val() - $(s).attr('min')) / ($(s).attr('max') - $(s).attr('min'));
    $(s).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', #88898c), '
                + 'color-stop(' + val + ', #3d3d3f)'
                + ')'
                );
  },position : function(){
    var s = $("#controllposition");
    var val = ($(s).val() - $(s).attr('min')) / ($(s).attr('max') - $(s).attr('min'));
    //84bd00
    $(s).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', #ab11a9), '
                + 'color-stop(' + val + ', #3d3d3f)'
                + ')'
                );
  }, prev : function(){
    this.options.ws.send({prev: true});
  },next : function(){
    this.options.ws.send({next: true});
  },pause : function(){
    this.options.ws.send({pause: true});
  },shuffle : function(){
    this.options.ws.send({random: true});
  },repeat: function(){
    this.options.ws.send({repeat: true});
  },party: function(){
    this.options.ws.send({party: true});
  },update : function(_,status){
    var image = "/images/playlistdefault.png";
    var title ="";
    var artists ="";
    if(status && status.track){
      var cover = status.track.album.cover;
      if(cover){
        image = imageUrl(cover);
      }
      title = status.track.title;
      status.track.artists.forEach(function(artist, i) {
          artists += artist.name +",&nbsp;";
      });
      artists = artists.substring(0,artists.length-7);

      document.title = "Bohnify - "+status.track.title;
      $("#controllposition").attr("max",status.track.duration);
      $("#controllduration").text(toMinutesAndSeconds(status.track.duration/1000));
    }
    this.$el.css("background-image","url('"+image+"')");
    $("#controlltrackimage").attr("src",image);
    $("#controlltrackname").html(title);
    $("#controlltrackartists").html(artists);
    $("#controllparty").removeClass("active disable").addClass(status.party ? "active" : "disable");
    $("#controllrepeat").removeClass("active disable").addClass(status.repeat ? "active" : "disable");
    $("#controllshuffle").removeClass("active disable").addClass(status.random ? "active" : "disable");
    $("#controllpause").removeClass("active disable").addClass(status.paused ? "disable" : "active");


    $("#controllposition").val(status.position);
    this.position();

    this.options.time = (new Date()).getTime();
    if(this.options.interval){
       clearInterval(this.options.interval);
    }
    this.options.interval = setInterval(function(){
      if(!status.paused && this.options.position){
        var t = (new Date()).getTime() - this.options.time;
        var t = t;
        var np = status.position+t;
        $("#controllposition").val(np);
        $("#controlltime").text(toMinutesAndSeconds(np/1000));
        this.position();
      }
    }.bind(this),200);
    if(this.options.volume){
      $("#controllvolume").val(status.volume);
      this.volume();
    }
    $("#controlltime").text(toMinutesAndSeconds(status.position/1000));
  },disablepos : function(){
    this.options.position = false;
  },activatepos : function(){
    this.options.ws.send({seek: $("#controllposition").val()});
    this.options.position = true;
  },disablevol : function(){
    this.options.volume = false;
  },activatevol : function(){
    this.options.ws.send({volume: $("#controllvolume").val()});
    this.options.volume = true;
  },increaseVolume : function(){
    this.options.ws.send({increasevolume: true});
  },decreaseVolume : function(){
    this.options.ws.send({decreasevolume: true});
  }, show : function(){
    this.$el.css("visibility","visible");
  }, close : function(){
    this.$el.css("visibility","hidden");
  }
});
