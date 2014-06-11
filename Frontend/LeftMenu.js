var LeftMenu = Backbone.View.extend({
  events : {
    'focus' : 'focus'
  },initialize: function(options) {
			this.model.on('add', this.render, this);
      this.model.on('remove', this.render, this);
      this.model.on('reset', this.render, this);
      this.options = options || {};
      this.options.un = "";
      this.options.pass = "";
      $(document).bind("keydown",this.test.bind(this));
	},
  render: function() {
    	var self = this;
    	self.$el.html('');
    	_.each(this.model.toArray(), function(playlist, i) {
    		self.$el.append((new PlaylistView({model: playlist, resultView : self.options.resultView})).render().$el);
    	});
	    return this;
	},test : function(ev){
    console.log(this.$el.find(".selected").length)
    if(this.$el.find(".selected")){
      console.log("asd")
    }else{
      console.log("nono")
    }
  }
});
