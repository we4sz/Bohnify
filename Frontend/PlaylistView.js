var PlaylistView = Backbone.View.extend({
  events : {
    'click .playlist' : 'show',
    'select': 'show'
  },initialize : function (options) {
    this.options = options || {};
    this.options.data = {type: "playlist", data:this.model};
  },
  render : function(){
      var html =  " <div class='playlist'>"
                  + "<div class='playlistnote'></div>"
                  + "<div class='playlistname'>"+this.model.get("name")+"</div>"
                  + "</div>";
      this.$el.html(html);
      return this;
  },show : function(){
    $(".playlist.selected").removeClass("selected");
    $(".playlist.passiveselected").removeClass("passiveselected");
    passiveSelectAll(this.$el.find(".playlist"));
    takeInFocus(this.$el.parent(),this.$el);
    this.$el.parent().parent().focus();
    if(this.options.resultView.options.data != this.options.data){
      this.options.resultView.options.data = this.options.data;
      this.options.resultView.render();
    }
  }
});
