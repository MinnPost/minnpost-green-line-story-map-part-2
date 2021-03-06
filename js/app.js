/**
 * Main application file for: minnpost-green-line-story-map-part-2
 *
 * This pulls in all the parts
 * and creates the main object for the application.
 */

// Create main application
define('minnpost-green-line-story-map-part-2', [
  'jquery', 'underscore', 'storymap',
  'mpConfig', 'mpStorymaps', 'helpers',
  'text!templates/application.underscore',
  'text!templates/fallback.underscore',
  'text!../data/story-map.json'
], function(
  $, _, storymap, mpConfig, mpStorymaps,
  helpers, tApplication, tFallback, dStorymap
  ) {


  // Constructor for app
  var App = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.el = this.options.el;
    this.$el = $(this.el);
    this.$ = function(selector) { return this.$el.find(selector); };
    this.$content = this.$el.find('.content-container');
    this.loadApp();
  };

  // Extend with custom methods
  _.extend(App.prototype, {
    // Start function
    start: function() {
      var thisApp = this;

      // Create main application view
      this.$el.html(_.template(tApplication, {
        data: {
        }
      }));

      // To ensure template DOM is loaded, wait a moment
      _.delay(function() {
        thisApp.build();
      }, 800);
    },

    // Build story map
    build: function() {
      var thisApp = this;

      // Replace image paths and parse JSON
      dStorymap = dStorymap.replace(/\[\[\[IMAGE_PATH\]\]\]/g, this.options.paths.images);
      this.slides = JSON.parse(dStorymap);

      // StoryMap comes nowhere near running in IE8 (and barely in IE9)
      if (helpers.isMSIE() <= 8 && helpers.isMSIE() > 4) {
        this.$('.content-container').html(_.template(tFallback, this.slides));
        return;
      }

      // Make map
      this.sMap = this.makeStorymap('green-line-story-map', this.slides, true);

      // When map is loaded.  This seems to only happen in landscape view.  :(
      this.sMap._map.on('loaded', function() {

        // Add Geojson green line layer.
        // This could not be done because StoryMap provides a hacked up
        // version of Leaflet with no GeoJSON layer and the even including
        // Leaflet itself cannot get around it

        // Remove loading
        thisApp.$('.initial.loading-block').slideUp('fast');

        // Update display
        thisApp.sMap.updateDisplay();
      });

      // Hack around portrait not trigger loading event, and it turns out
      // even portait can be trigger on bigger screens
      if (this.$('#green-line-story-map').width() <= 675) {
        this.$('.initial.loading-block').slideUp('fast');
      }
      _.delay(function() {
        thisApp.$('.initial.loading-block').slideUp('fast');
      }, 1500);
    },

    // Wrapper around creating a map
    makeStorymap: function(id, data, expand) {
      expand = expand || false;
      var $map = $('#' + id);
      var wWidth = $(window).width();
      var sMap, mapOffset;

      // Expand container to width of window
      if (expand && wWidth > ($map.width() + 30)) {
        mapOffset = $map.offset();
        $map.parent().css('position', 'relative');
        $map
          .css('position', 'relative')
          .css('left', (mapOffset.left * -1) + 'px')
          .width($(window).width())
          .addClass('expanded');
      }

      // Make map
      sMap = new storymap.StoryMap(id, data, {
        map_type: 'https://{s}.tiles.mapbox.com/v3/minnpost.map-wi88b700/{z}/{x}/{y}.png',
        map_subdomains: 'abcd',
        map_mini: false,
        line_color: '#0D57A0',
        line_color_inactive: '#404040',
        line_join: 'miter',
        line_weight: 3,
        line_opacity: 0.90,
        line_dash: '5,5',
        show_lines: true,
        show_history_line: true,
        calculate_zoom: (this.$('#green-line-story-map').width() <= 675)
        //slide_padding_lr: 20,
        //layout: 'landscape',
        //width: '100%'
      });

      // Customize map a bit
      sMap._map.on('loaded', function() {
        this._map.removeControl(this._map.attributionControl);

        // Some styles are manually added
        $map.find('.vco-storyslider .vco-slider-background').attr('style', '');
      });

      // Handle resize
      $(window).on('resize', function(e) {
        _.throttle(function() {
          sMap.updateDisplay();
        }, 400);
      });

      return sMap;
    },

    // Default options
    defaultOptions: {
      projectName: 'minnpost-green-line-story-map-part-2',
      remoteProxy: null,
      el: '.minnpost-green-line-story-map-part-2-container',
      availablePaths: {
        local: {

          css: ['.tmp/css/main.css'],
          images: 'images/',
          data: 'data/'
        },
        build: {
          css: [
            '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',
            'dist/minnpost-green-line-story-map-part-2.libs.min.css',
            'dist/minnpost-green-line-story-map-part-2.latest.min.css'
          ],
          ie: [
            'dist/minnpost-green-line-story-map-part-2.libs.min.ie.css',
            'dist/minnpost-green-line-story-map-part-2.latest.min.ie.css'
          ],
          images: 'dist/images/',
          data: 'dist/data/'
        },
        deploy: {
          css: [
            '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',
            'https://s3.amazonaws.com/data.minnpost/projects/minnpost-green-line-story-map-part-2/minnpost-green-line-story-map-part-2.libs.min.css',
            'https://s3.amazonaws.com/data.minnpost/projects/minnpost-green-line-story-map-part-2/minnpost-green-line-story-map-part-2.latest.min.css'
          ],
          ie: [
            'https://s3.amazonaws.com/data.minnpost/projects/minnpost-green-line-story-map-part-2/minnpost-green-line-story-map-part-2.libs.min.ie.css',
            'https://s3.amazonaws.com/data.minnpost/projects/minnpost-green-line-story-map-part-2/minnpost-green-line-story-map-part-2.latest.min.ie.css'
          ],
          images: 'https://s3.amazonaws.com/data.minnpost/projects/minnpost-green-line-story-map-part-2/images/',
          data: 'https://s3.amazonaws.com/data.minnpost/projects/minnpost-green-line-story-map-part-2/data/'
        }
      }
    },

    // Load up app
    loadApp: function() {
      this.determinePaths();
      this.getLocalAssests(function(map) {
        this.renderAssests(map);
        this.start();
      });
    },

    // Determine paths.  A bit hacky.
    determinePaths: function() {
      var query;
      this.options.deployment = 'deploy';

      if (window.location.host.indexOf('localhost') !== -1) {
        this.options.deployment = 'local';

        // Check if a query string forces something
        query = helpers.parseQueryString();
        if (_.isObject(query) && _.isString(query.mpDeployment)) {
          this.options.deployment = query.mpDeployment;
        }
      }

      this.options.paths = this.options.availablePaths[this.options.deployment];
    },

    // Get local assests, if needed
    getLocalAssests: function(callback) {
      var thisApp = this;

      // If local read in the bower map
      if (this.options.deployment === 'local') {
        $.getJSON('bower.json', function(data) {
          callback.apply(thisApp, [data.dependencyMap]);
        });
      }
      else {
        callback.apply(this, []);
      }
    },

    // Rendering tasks
    renderAssests: function(map) {
      var isIE = (helpers.isMSIE() && helpers.isMSIE() <= 8);

      // Add CSS from bower map
      if (_.isObject(map)) {
        _.each(map, function(c, ci) {
          if (c.css) {
            _.each(c.css, function(s, si) {
              s = (s.match(/^(http|\/\/)/)) ? s : 'bower_components/' + s + '.css';
              $('head').append('<link rel="stylesheet" href="' + s + '" type="text/css" />');
            });
          }
          if (c.ie && isIE) {
            _.each(c.ie, function(s, si) {
              s = (s.match(/^(http|\/\/)/)) ? s : 'bower_components/' + s + '.css';
              $('head').append('<link rel="stylesheet" href="' + s + '" type="text/css" />');
            });
          }
        });
      }

      // Get main CSS
      _.each(this.options.paths.css, function(c, ci) {
        $('head').append('<link rel="stylesheet" href="' + c + '" type="text/css" />');
      });
      if (isIE) {
        _.each(this.options.paths.ie, function(c, ci) {
          $('head').append('<link rel="stylesheet" href="' + c + '" type="text/css" />');
        });
      }

      // Add a processed class
      this.$el.addClass('processed');
    }
  });

  return App;
});


/**
 * Run application
 */
require(['jquery', 'minnpost-green-line-story-map-part-2'], function($, App) {
  $(document).ready(function() {
    var app = new App();
  });
});
