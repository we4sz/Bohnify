var PlaylistItem = Backbone.View.extend({
  events : {
    'click' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
    this.options.data = {type: "playlist", data:this.model};
  },
  render : function(){
    this.$el.addClass("playlist");
      var html =  "<div class='playlistnote'></div>"
                  + "<div class='playlistname'>"+this.model.get("name")+"</div>";
      this.$el.html(html);
      return this;
  },show : function(_,notChange){
    $(".playlist.selected").removeClass("selected");
    $(".playlist.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el);
    takeInFocus(this.$el.parent(),this.$el);
    if(!notChange){
      $("#result").trigger("update",[this.options.data]);
    }
  }
});
