$(function($) {
  var CloseableView = Backbone.View.extend({
    rendered: function(subView) {
      if (!this._renderedSubViews) {
        this._renderedSubViews = [];
      }

      if (_(this._renderedSubViews).indexOf(subView) === -1) {
        this._renderedSubViews.push(subView);
      }
      return subView;
    },

    closed: function(subView) {
      this._renderedSubViews = _(this._renderedSubViews).without(subView);
    },

    close: function() {
      this.$el.empty();
      this.undelegateEvents();

      if (this._renderedSubViews) {
        for (var i = 0; i < this._renderedSubViews.length; i++) this._renderedSubViews[i].close();
      }
      if (this.onClose) this.onClose();
    }
  });

  var DetailView = Backbone.View.extend({
    render: function() {
      this.$el.text(this.model.get('detail'));
      return this;
    }
  });

  var ExpandableView =  Backbone.View.extend({
    events: {
      'click .name': '_clickName'
    },
    render: function() {
      this.$el.html(_.template($('#expandable').text())(this.model));
      return this;
    },
    _clickName: function(evt) {
      this._expanded = !this._expanded;

      if (this._expanded) {
        new DetailView({model: this.model, el: this.$('.detail')}).render();
      } else {
        this.$('.detail').empty();
      }
      evt.preventDefault();
    }
  });

  var EmptyView = CloseableView.extend({
    render: function() {
      // Do nothing
      return this;
    }
  });

  var model = new Backbone.Model({name: 'Bert', detail: 'A little uptight'});

  var expandableView = new ExpandableView({model: model, el: $('.content')});
  var emptyView = new EmptyView({el: $('.content')});

  var Router = Backbone.Router.extend({
    routes: {
      "tab1": "showTab1",
      "tab2": "showTab2"
    },
    showTab1: function() {
      $('.tab2').removeClass('active');
      $('.tab1').addClass('active');
      $('.content').empty();
      expandableView.render();
    },
    showTab2: function() {
      $('.tab1').removeClass('active');
      $('.tab2').addClass('active');
      $('.content').empty();
      emptyView.render();
    }
  });

  var router = new Router();

  Backbone.history.start({ pushState: false });
});