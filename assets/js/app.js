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

  var DetailView = CloseableView.extend({
    render: function() {
      this.$el.text(this.model.get('detail'));
      return this;
    }
  });

  var ExpandableView =  CloseableView.extend({
    events: {
      'click .name': '_clickName'
    },
    render: function() {
      this.$el.html(_.template($('#template').text())(this.model));

      if (this._isSelected) {
        this._renderDetailView();
      }
      return this;
    },
    _clickName: function(evt) {
      this._isSelected = !this._isSelected;

      if (this._isSelected) {
        if (!this._detailView) {
          this._detailView = new DetailView({model: this.model});
        }

        this._renderDetailView();
      } else {
        this._detailView.close();
        this.closed(this._detailView);
      }

      evt.preventDefault();
    },
    _renderDetailView: function() {
      this._detailView.setElement(this.$('.detail'));
      this._detailView.render();
      this.rendered(this._detailView);
    }
  });

  var TabView1 = CloseableView.extend({
    render: function() {
      if (!this._expandableView) {
        this._expandableView = new ExpandableView({model: this.model});
      }

      this._expandableView.setElement(this.$el);
      this._expandableView.render();
      this.rendered(this._expandableView);
      return this;
    }
  });

  var RowExpandableView = ExpandableView.extend({
    onClose: function() {
      this.remove();
    }
  });

  var TabView2 = CloseableView.extend({
    render: function() {
      this.$el.empty();
      collection.each(function(model) {
        var expandableView = new RowExpandableView({model: model});
        this.$el.append(expandableView.render().$el);
        this.rendered(expandableView);
      }, this);
      return this;
    }
  });

  var Model = Backbone.Model.extend({});
  var Collection = Backbone.Collection.extend({model: Model});

  var collection = new Collection([
    new Model({name: 'Bert', detail: 'A little uptight'}),
    new Model({name: 'Ernie', detail: 'The relaxed one'})
  ]);

  var tabView1 = new TabView1({model: collection.first()});
  var tabView2 = new TabView2({collection: collection});

  var Router = Backbone.Router.extend({
    routes: {
      "tab1": "showTab1",
      "tab2": "showTab2"
    },
    showTab1: function() {
      $('.tab2').removeClass('active');
      $('.tab1').addClass('active');

      tabView2.close();
      tabView1.setElement($('.content'));
      tabView1.render();
    },
    showTab2: function() {
      $('.tab1').removeClass('active');
      $('.tab2').addClass('active');
      tabView1.close();
      tabView2.setElement($('.content'));
      tabView2.render();
    }
  });

  var router = new Router();

  Backbone.history.start({ pushState: false });
});