var ControllerMobileView = Backbone.View.extend({
  events : {
    'click #controllprev' : 'prev',
    'click #controllpause' : 'pause',
    'click #controllnext' : 'next',
    'click #controllshuffle' : 'shuffle',
    'click #controllrepeat' : 'repeat',
    'click #controllparty' : 'party',
    'click #controllmenu' : 'menu',
    'click #controlltrackimage' : 'menu',
    'input #controllposition' : 'position',
    'status' : 'update',
    'touchstart #controllposition' : 'disablepos',
    'touchend #controllposition' : 'activatepos',
    'click #controllvolume' : 'showvol',
    'show' : 'show',
    'click #controllexit' : 'close'
  },initialize : function (options) {
    this.options = options || {};
    this.options.position = true;
    this.options.volume = true;
    window.addEventListener("orientationchange", function() {
      this.changeorientation();
      this.fixsize();
    }.bind(this));
    window.addEventListener("resize", function(){
      this.fixsize();
    }.bind(this));

  },
  render : function(){
    var html = "<div id='controlllayer'></div>"
              + "<table id='controlltop'>"
              + "<td id='controlltopleft' class='controllcolumn'></td>"
              + "<td id='controlltopmiddle' class='controllcolumn'></td>"
              + "<td id='controlltopright' class='controllcolumn'></td>"
              + "</table>"
              + "<table id='controllmiddle'>"
              + "<td id='controllmiddleleft' class='controllcolumn'></td>"
              + "<td id='controllmiddlemiddle' class='controllcolumn'></td>"
              + "<td id='controllmiddleright' class='controllcolumn'></td>"
              + "</table>"
              + "<table id='controlldownmiddle'>"
              + "<td id='controlldownmiddleleft' class='controllcolumn'></td>"
              + "<td id='controlldownmiddlemiddle' class='controllcolumn'></td>"
              + "<td id='controlldownmiddleright' class='controllcolumn'></td>"
              + "</table>"
              + "<table id='controllbottom'>"
              + "<td id='controllbottomleft' class='controllcolumn'></td>"
              + "<td id='controllbottommiddle' class='controllcolumn'></td>"
              + "<td id='controllbottomright' class='controllcolumn'></td>"
              + "</table>"
              + "<div id='controllexit'></div>"
              + "<div id='controlltrackimage'></div>"
              + "<div id='controlltime' class='controller'>00:00</div>"
              + "<div id='controlltogglers'>"
              + "<div id='controllparty' class='disable controller'></div>"
              + "<div id='controllshuffle' class='disable controller'></div>"
              + "<div id='controllrepeat' class='disable controller'></div>"
              + "</div>"
              + "<div id='controlltrack'>"
              + "<div id='controlltrackname'></div>"
              + "<div id='controlltrackartists'></div>"
              + "</div>"
              + "<input id='controllposition' min='0' max='100' value='0' type='range' class='controller'/>"
              + "<div id='controllplayback'>"
              + "<div id='controllprev' class='disable controller'></div>"
              + "<div id='controllpause' class='active controller'></div>"
              + "<div id='controllnext' class='disable controller'></div>"
              + "</div>"
              + "<div id='controllmenu'></div>"
              + "<div id='controllduration' class='controller'>00:00</div>"
              + "<div id='controllvolume'></div>";
    this.$el.html(html);
    this.changeorientation();
    this.fixsize();
    return this;
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
    this.model = status;
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

    $("#controlllayer").css("background-image","url('"+image+"')");
    $("#controlltrackimage").css("background-image","url('"+image+"')");
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

    if(this.options.volume && $("#contextvolume").length == 1){
      $("#contextvolume").val(status.volume);
      this.volume();
    }

    $("#controlltime").text(toMinutesAndSeconds(status.position/1000));
  },disablepos : function(){
    this.options.position = false;
  },activatepos : function(){
    this.options.ws.send({seek: $("#controllposition").val()});
    this.options.position = true;
  },volume: function(){
    var s = $("#contextvolume");
    var val = ($(s).val() - $(s).attr('min')) / ($(s).attr('max') - $(s).attr('min'));
    $(s).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', #88898c), '
                + 'color-stop(' + val + ', #1a1a1a)'
                + ')'
                );
  },showvol: function(){
    var add = $("#contextmenu").length == 0;
    $("#contextmenu").remove();
    if(this.model && this.model.track && add){
      var html =  "<div id='contextmenu'>" +
                  "<div class='contextitem'><input id='contextvolume' max=100 min=0 value="+this.model.volume+" type='range' /></div>" +
                  "</div>";
      var el = $($.parseHTML(html));



      el.find("#contextvolume").on("touchstart",function(){
        this.options.volume = false;
      }.bind(this));

      el.find("#contextvolume").on("touchend",function(){
        this.options.ws.send({volume: $("#contextvolume").val()});
        this.options.volume = true;
      }.bind(this));

      el.find("#contextvolume").on("input",function(){
        this.volume();
      }.bind(this));


      $(document.body).append(el);
      var h = el.find(".contextitem").outerHeight();
      el.css('height',(h*el.find(".contextitem").length)+"px");
      this.volume();
      return false;
    }
  },increaseVolume : function(){
    this.options.ws.send({increasevolume: true});
  },decreaseVolume : function(){
    this.options.ws.send({decreasevolume: true});
  }, show : function(){
    this.$el.css("display","inline");
    this.fixsize();
  }, close : function(){
    this.$el.css("display","none");
    this.fixsize();

  }, changeorientation : function(){
    var topl = $("#controlltopleft");
    var topm = $("#controlltopmiddle");
    var topr = $("#controlltopright");
    var middlel = $("#controllmiddleleft");
    var middlem = $("#controllmiddlemiddle");
    var middler = $("#controllmiddleright");
    var middledl = $("#controlldownmiddleleft");
    var middledm = $("#controlldownmiddlemiddle");
    var middledr = $("#controlldownmiddleright");
    var bottoml = $("#controllbottomleft");
    var bottomm = $("#controllbottommiddle");
    var bottomr = $("#controllbottomright");
    var exit = $("#controllexit");
    var image = $("#controlltrackimage");
    var togglers = $("#controlltogglers");
    var time = $("#controlltime");
    var track = $("#controlltrack");
    var position = $("#controllposition");
    var playback = $("#controllplayback");
    var menu = $("#controllmenu");
    var duration = $("#controllduration");
    var volume = $("#controllvolume");
    exit.remove();
    image.remove();
    time.remove();
    togglers.remove();
    track.remove();
    position.remove();
    playback.remove();
    menu.remove();
    duration.remove();
    volume.remove();
    if(window.orientation == 0 ){
      topl.append(exit);
      middlel.append(image);
      bottoml.append(togglers);
      bottoml.append(time);
      bottomm.append(track);
      bottomm.append(playback);
      bottomm.append(position);
      bottomr.append(menu);
      bottomr.append(volume);
      bottomr.append(duration);
    }else{
      topl.append(exit);
      middlel.append(image);
      middlem.append(track);
      middler.append(menu);
      middledl.append(time);
      middledm.append(position);
      middledr.append(duration);
      bottoml.append(togglers);
      bottomm.append(playback);
      bottomr.append(volume);
    }
  }, fixsize: function(){
    var middle = $("#controllmiddle");
    var img = $("#controlltrackimage");
    var left = $("#controllmiddleleft");
    img.css("width","0px");
    img.css("height","0px");
    if(window.orientation == 0 ){
      img.css("width","100%");
      img.css("height",middle.innerHeight()+"px");
      left.css("width","100%");
    }else{
      img.css("width",middle.innerHeight()+"px");
      img.css("height",middle.innerHeight()+"px");
      left.css("width",img.outerWidth(true)+"px");
    }
  }, menu : function(){
    var add = $("#contextmenu").length == 0;
    $("#contextmenu").remove();
    if(this.model && this.model.track && add){
      var html =  "<div id='contextmenu'>" +
                  "<div id='contextqueue' class='contextitem'>Queue</div>" +
                  "<div id='contextartist' class='contextitem'>Artist</div>" +
                  "<div id='contextalbum' class='contextitem'>Albm</div>" +
                  "</div>";
      var el = $($.parseHTML(html));

      el.find("#contextqueue").click(function(ev){
        this.options.ws.send({manualqueue: [this.model.track.uri]});
        el.remove();
      }.bind(this));

      el.find(".contextitem").on("touchstart",function(){
        $(this).css("background-color","#575757");
      });

      el.find("#contextartist").click(function(ev){
        $("#result").trigger("update",{type: "load"});
        this.options.ws.send({search : "spotify:"+this.model.track.artists[0].uri});
        el.remove();
      }.bind(this));

      el.find("#contextalbum").click(function(ev){
        $("#result").trigger("update",{type: "load"});
        this.options.ws.send({search : "spotify:"+this.model.track.album.uri});
        el.remove();
      }.bind(this));


      $(document.body).append(el);
      var h = el.find(".contextitem").outerHeight();
      el.css('height',(h*el.find(".contextitem").length)+"px");
      return false;
    }
  }
});
