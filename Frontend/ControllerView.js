var ControllerView = Backbone.View.extend({
  events : {
    'input #controllvolume' : 'volume',
    'click #controllprev' : 'prev',
    'click #controllpause' : 'pause',
    'click #controllnext' : 'next',
    'click #controllshuffle' : 'shuffle',
    'click #controllrepeat' : 'repeat',
    'input #controllposition' : 'position'
  },
  render : function(){
      var html =  " <div id='controllprev' class='disable controller'></div>"
                  + "<div id='controllpause' class='disable controller'></div>"
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
  },volume : function(ss){
    var s = ss.currentTarget;
    var val = ($(s).val() - $(s).attr('min')) / ($(s).attr('max') - $(s).attr('min'));
    $(s).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', #88898c), '
                + 'color-stop(' + val + ', #3d3d3f)'
                + ')'
                );
  },position : function(ss){
    var s = ss.currentTarget;
    var val = ($(s).val() - $(s).attr('min')) / ($(s).attr('max') - $(s).attr('min'));
    //84bd00
    $(s).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', #ab11a9), '
                + 'color-stop(' + val + ', #3d3d3f)'
                + ')'
                );
  }, prev : function(){

  },next : function(){

  },pause : function(){

  },shuffle : function(){

  },repeat: function(){

  }
});
