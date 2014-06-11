var LeftMenu = Backbone.View.extend({
  initialize: function(options) {
			this.model.on('add', this.render, this);
      this.model.on('remove', this.render, this);
      this.model.on('reset', this.render, this);
      this.options = options || {};
      this.options.un = "";
      this.options.pass = "";
      $(document).bind("keydown",this.keyevent.bind(this));
	},
  render: function() {
    	var self = this;
    	self.$el.html('');
    	_.each(this.model.toArray(), function(playlist, i) {
    		self.$el.append((new PlaylistView({model: playlist, resultView : self.options.resultView})).render().$el);
    	});
	    return this;
	},keyevent : function(ev){
    if(ev.keyCode == 40 || ev.keyCode == 38 || ev.keyCode == 39||ev.keyCode == 37){
      ev.preventDefault();
      if(this.$el.find(".selected").length > 0){
        if(ev.keyCode == 40 || ev.keyCode == 38){
          var parent =this.$el.find(".selected").parent();
          var left = parent.nextAll();
          if(ev.keyCode == 38){
            parent = this.$el.find(".selected").parent();
            left = parent.prevAll();
          }
          if(left.length > 0){
            var select = $(left.get(0)).find(".playlist");
            select.parent().trigger("select");
          }
        }else if(ev.keyCode == 39){
          var track = $(".track.passiveselected");
          if(track.length > 0){
            track.trigger("select");
          }else{
            var tracks = $(".track");
            if(tracks.length > 0){
              $(tracks.get(0)).trigger("select");
            }
          }
        }
      }
    }
  }
});
