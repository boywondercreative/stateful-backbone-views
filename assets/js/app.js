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

  var model = new Backbone.Model({name: 'Bert', detail: 'A little uptight'});

  var Router = Backbone.Router.extend({
    routes: {
      "tab1": "showTab1",
      "tab2": "showTab2"
    },
    showTab1: function() {
      $('.tab2').removeClass('active');
      $('.tab1').addClass('active');

      if (!this._expandableView) this._expandableView = new ExpandableView({model: model});
      if (this._emptyView) this._emptyView.close();
      this._expandableView.setElement($('.content'));
      this._expandableView.render();
    },
    showTab2: function() {
      $('.tab1').removeClass('active');
      $('.tab2').addClass('active');

      if (!this._emptyView) this._emptyView = new EmptyView({model: model});
      if (this._expandableView) this._expandableView.close();
      this._emptyView.setElement($('.content'));
      this._emptyView.render();
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

  var EmptyView = CloseableView.extend({
    render: function() {
      // Do nothing
      return this;
    }
  });

  var DetailView = CloseableView.extend({
    render: function() {
      this.$el.text(this.model.get('detail'));
      return this;
    }
  });

  var router = new Router();

  Backbone.history.start({ pushState: false });
});