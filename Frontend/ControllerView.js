var ControllerView = Backbone.View.extend({
  events : {
    'input #controllvolume' : 'volume',
    'click #controllprev' : 'prev',
    'click #controllpause' : 'pause',
    'click #controllnext' : 'next',
    'click #controllshuffle' : 'shuffle',
    'click #controllrepeat' : 'repeat',
    'input #controllposition' : 'position',
    'status' : 'update',
    'mousedown #controllposition' : 'disablepos',
    'mouseup #controllposition' : 'activatepos',
    'mousedown #controllvolume' : 'disablevol',
    'mouseup #controllvolume' : 'activatevol'
  },initialize : function (options) {
    this.options = options || {};
    this.options.position = true;
    this.options.volume = true;
  },
  render : function(){
      var html =  " <div id='controllprev' class='disable controller'></div>"
                  + "<div id='controllpause' class='active controller'></div>"
                  + "<div id='controllnext' class='disable controller'></div>"
                  + "<input id='controllvolume' value='100' min='0' max='100'  type='range' class='controller'/>"
                  + "<div id='controllspeaker' class='controller'></div>"
                  + "<div id='controlltime' class='controller'>00:00</div>"
                  + "<input id='controllposition' min='0' max='100' value='0' type='range' class='controller'/>"
                  + "<div id='controllduration' class='controller'>01:00</div>"
                  + "<div id='controllshuffle' class='disable controller'></div>"
                  + "<div id='controllrepeat' class='disable controller'></div>";
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
    this.options.ws.send(JSON.stringify({prev: true}));
  },next : function(){
    this.options.ws.send(JSON.stringify({next: true}));
  },pause : function(){
    this.options.ws.send(JSON.stringify({pause: true}));
  },shuffle : function(){
    this.options.ws.send(JSON.stringify({random: true}));
  },repeat: function(){
    this.options.ws.send(JSON.stringify({repeat: true}));
  },update : function(_,status){
    $("#controllpause").removeClass("active disable").addClass(status.paused ? "disable" : "active");
    $("#controllrepeat").removeClass("active disable").addClass(status.repeat ? "active" : "disable");
    $("#controllshuffle").removeClass("active disable").addClass(status.random ? "active" : "disable");
    if(status.track){
      $("#controllposition").attr("max",status.track.get("duration"));
      $("#controllduration").text(toMinutesAndSeconds(status.track.get("duration")));
    }
    $("#controllposition").val(status.position);
    this.options.time = (new Date()).getTime();
    if(this.options.interval){
       clearInterval(this.options.interval);
    }
    this.options.interval = setInterval(function(){
      if(!status.paused && this.options.position){
        var t = (new Date()).getTime() - this.options.time;
        var t = t/1000;
        var np = status.position+t;
        $("#controllposition").val(np);
        $("#controlltime").text(toMinutesAndSeconds(np));
        this.position();
      }
    }.bind(this),200);
    if(this.options.volume){
      $("#controllvolume").val(status.volume);
    }
    $("#controlltime").text(toMinutesAndSeconds(status.position));
  },disablepos : function(){
    this.options.position = false;
  },activatepos : function(){
    this.options.ws.send(JSON.stringify({seek: $("#controllposition").val()}));
    this.options.position = true;
  },disablevol : function(){
    this.options.volume = false;
  },activatevol : function(){
    this.options.ws.send(JSON.stringify({volume: $("#controllvolume").val()}));
    this.options.volume = true;
  }
});
