/**
 *
 * .City Web of Things Framework
 * 
 * Copyright 2015 Jollen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

"use strict";

/**
 * Expose `Automation` class. (NodeJS)
 */
if (typeof(module) !== "undefined" && typeof(exports) !== "undefined") {
  exports = module.exports = Automation;
}

/*
 * Module dependencies.
 */
var Backbone = require('backbone');
var _ = require('underscore');

/*
 * Prototype
 */
Automation.prototype.extend = function(self) {
  // merge
  for(var prop in self) {
      if(self.hasOwnProperty(prop)) {
        this[prop] = self[prop];
      }
  }

  return this;
};

/*
 * Class
 */
function Automation(options) {
  this.super();

  // initialize the private options
  this._options = {};

  // set configurations
  if (typeof(options.app) === 'object') {
    this._options.app = options.app;
  }

  // Prepare the framework.
  // - copy applications methods
  return this.extend(this._options.app);
};

/**
 * EventAggregator can be used to decouple various parts
 * of an application through event-driven architecture.
 *
 * Borrowing this code from https://github.com/marionettejs/backbone.wreqr/blob/master/src/wreqr.eventaggregator.js
 */
Automation.EventAggregator = function () {

  var EA = function(){};

  // Copy the *extend* function used by Backbone's classes
  EA.extend = Backbone.Model.extend;

  // Copy the basic Backbone.Events on to the event aggregator
  _.extend(EA.prototype, Backbone.Events);

  return new EA();
};

/**
 * Container
 *
 * The container to store, retrieve child elements.
 * Borrowing this code from https://github.com/marionettejs/backbone.babysitter
 */
Automation.ChildElementContainer = function (context) {

  // Container Constructor
  // ---------------------

  var Container = function() {
    this._elements = [];
    this._models = [];
  };

  // Container Methods
  // -----------------
  _.extend(Container.prototype, {
    // Add an element to this container. Stores the element
    // by `cid` and makes it searchable by the model
    // cid (and model itself). 
    add: function(options){
      var model = options.model
        , cid = options.cid;

      // store the model and index by cid
      this._models[cid] = model;

      this._updateLength();

      return this;
    },

    findModelByCid: function(cid) {
      return this._models[cid];
    },

    updateModelByCid: function(cid, model) {
      this._models[cid] = model;
    },

    // Remove a cid
    remove: function(cid){
      delete this._models[cid];

      // update the length
      this._updateLength();

      return this;
    },

    // Fetch data of every element
    fetch: function() {
      _.each(this._models, function(model) {
        var cid = model.get('cid');

        model.fetch({
          success: function(model, response, options) {
            if (_.isFunction(model.parseJSON))
              model.parseJSON(response);
          }.bind(model)
        });
      }.bind(this));
    },

    // Call a method on every element in the container,
    // passing parameters to the call method one at a
    // time, like `function.call`.
    call: function(method){
      this.apply(method, _.tail(arguments));
    },

    // Apply a method on every element in the container,
    // passing parameters to the call method one at a
    // time, like `function.apply`.
    apply: function(method, args){
      _.each(this._elements, function(elem){
        if (_.isFunction(elem[method])){
          elem[method].apply(elem, args || []);
        }
      });
    },

    // Update the `.length` attribute on this container
    _updateLength: function(){
      this.length = _.size(this._elements);
    }
  });

  // Borrowing this code from Backbone.Collection:
  // http://backbonejs.org/docs/backbone.html#section-106
  //
  // Mix in methods from Underscore, for iteration, and other
  // collection related features.
  var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
    'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
    'last', 'without', 'isEmpty', 'pluck'];

  _.each(methods, function(method) {
    Container.prototype[method] = function() {
      var elements = _.values(this._elements);
      var args = [elements].concat(_.toArray(arguments));
      return _[method].apply(_, args);
    };
  });

  // return the public API
  return new Container();
}

// constructor
Automation.prototype.super = function() {
  // private properties
  this._model = Backbone.Model.extend({});
  this._count = 0;
  this._handlers = [];

  // constructor
  this._observer = new Automation.ChildElementContainer();
  this._eventAggragator = new Automation.EventAggregator();

  // notifying listing objects of state changes
  this._eventAggragator.on('forceUpdateAll', function() {
    // update every model in the container
  }.bind(this));
};

/**
 * Add `thing` to observer. A `things` is described in JSON-LD.
 */
Automation.prototype._add = function(thing) { 
  var model = new this._model();

  // convert JSON-LD to model
  for(var prop in thing) {
      if(thing.hasOwnProperty(prop))
        model.set(prop, thing[prop]);
  }

  // child ID is automatically increased
  model.set('cid', this._count);

  // bind model change event
  model.bind('change', function(model) {
    var cid = model.get('cid');
  }.bind(this), model);

  // push
  this._observer.add({
    model: model,
    cid: this._count,
  });

  this._count++;

  return model;
};

Automation.prototype.trigger = function(event) {
  this._eventAggragator.trigger(event);
};

/**
 * Framework APIs
 */

Automation.prototype.registerThing = function(thing) {
  console.log('[framework]: registerThing: ' + thing.name);
  return this._add(thing);
};