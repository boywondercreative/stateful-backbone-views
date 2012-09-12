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
  var collection = new Backbone.Collection([
    model,
    new Backbone.Model({name: 'Ernie', detail: 'More relaxed'})
  ]);

  var Router = Backbone.Router.extend({
    routes: {
      "tab1": "showTab1",
      "tab2": "showTab2"
    },
    showTab1: function() {
      $('.tab2').removeClass('active');
      $('.tab1').addClass('active');

      if (!this._expandableView) this._expandableView = new ExpandableView({model: model});
      if (this._listView) this._listView.close();
      this._expandableView.setElement($('.content'));
      this._expandableView.render();
    },
    showTab2: function() {
      $('.tab1').removeClass('active');
      $('.tab2').addClass('active');

      if (!this._listView) this._listView = new ListView({collection: collection});
      if (this._expandableView) this._expandableView.close();
      this._listView.setElement($('.content'));
      this._listView.render();
    }
  });

  var ExpandableView =  CloseableView.extend({
    events: {
      'click .name': '_clickName'
    },
    render: function() {
      this.$el.html(_.template($('#template').text())(this.model));

      if (this._isExpanded) {
        this._renderDetailView();
        this._detailView.$el.show();
      }
      return this;
    },
    _clickName: function(evt) {
      this._isExpanded = !this._isExpanded;

      if (this._isExpanded) {
        if (!this._detailView) {
          this._detailView = new DetailView({model: this.model});
        }

        this._renderDetailView();
        this._detailView.$el.slideDown();
      } else {
        this._detailView.$el.slideUp(_.bind(function() {
          this._detailView.close();
          this.closed(this._detailView);
        }, this));
      }

      evt.preventDefault();
    },
    _renderDetailView: function() {
      this._detailView.setElement(this.$('.detail'));
      this._detailView.render();
      this.rendered(this._detailView);
    }
  });

  var ListView = CloseableView.extend({
    render: function() {
      if (!this._expandableViews) {
        this._expandableViews = [];
      }

      var modelsWithViews = _(this._expandableViews).pluck('model');

      var modelsThatNeedViews = _.difference(this.collection.models, modelsWithViews);
      _(modelsThatNeedViews).each(function(model) {
        this._expandableViews.push(new ExpandableView({model: model}));
      }, this);

      var modelsWhoseViewsShouldBeRemoved = _.difference(modelsWithViews, this.collection.models);
      _(modelsWhoseViewsShouldBeRemoved).each(function(model) {
        // Find the view to be removed
        var expandableView = _(this._expandableViews).find(function(expandableView) {
          return expandableView.model === model;
        });
        expandableView.close();
        this._expandableViews = _(this._expandableViews).without(expandableView);
      }, this);

      this.$el.empty();

      _(this._expandableViews).each(function(expandableView) {
        this.$el.append(expandableView.render().$el);
        this.rendered(expandableView);
        expandableView.delegateEvents();
      }, this);
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