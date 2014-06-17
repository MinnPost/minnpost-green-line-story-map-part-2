
/**
 * Helpers functions such as formatters or extensions
 * to libraries.
 */
define('helpers', ['jquery', 'underscore'],
  function($, _) {

  var helpers = {};

  /**
   * Override Backbone's ajax call to use JSONP by default as well
   * as force a specific callback to ensure that server side
   * caching is effective.
   */
  helpers.overrideBackboneAJAX = function() {
    Backbone.ajax = function() {
      var options = arguments;

      if (options[0].dataTypeForce !== true) {
        options[0].dataType = 'jsonp';
        options[0].jsonpCallback = 'mpServerSideCachingHelper' +
          _.hash(options[0].url);
      }
      return Backbone.$.ajax.apply(Backbone.$, options);
    };
  };

  /**
   * Returns version of MSIE.
   */
  helpers.isMSIE = function() {
    var match = /(msie) ([\w.]+)/i.exec(navigator.userAgent);
    return match ? parseInt(match[2], 10) : false;
  };

  /**
   * Wrapper for a JSONP request, the first set of options are for
   * the AJAX request, while the other are from the application.
   */
  helpers.jsonpRequest = function(requestOptions, appOptions) {
    options.dataType = 'jsonp';
    options.jsonpCallback = 'mpServerSideCachingHelper' +
      _.hash(options.url);

    if (appOptions.remoteProxy) {
      options.url = options.url + '&callback=mpServerSideCachingHelper';
      options.url = appOptions.remoteProxy + encodeURIComponent(options.url);
      options.cache = true;
    }

    return $.ajax.apply($, [options]);
  };

  /**
   * Data source handling.  For development, we can call
   * the data directly from the JSON file, but for production
   * we want to proxy for JSONP.
   *
   * `name` should be relative path to dataset
   * `options` are app options
   *
   * Returns jQuery's defferred object.
   */
  helpers.getLocalData = function(name, options) {
    var useJSONP = false;
    var defers = [];
    name = (_.isArray(name)) ? name : [ name ];

    // If the data path is not relative, then use JSONP
    if (options && options.paths && options.paths.data.indexOf('http') === 0) {
      useJSONP = true;
    }

    // Go through each file and add to defers
    _.each(name, function(d) {
      var defer;

      if (useJSONP) {
        defer = helpers.jsonpRequest({
          url: proxyPrefix + encodeURI(options.paths.data + d)
        }, options);
      }
      else {
        defer = $.getJSON(options.paths.data + d);
      }
      defers.push(defer);
    });

    return $.when.apply($, defers);
  };

  /**
   * Reads query string and turns into object.
   */
  helpers.parseQueryString = function() {
    var assoc  = {};
    var decode = function(s) {
      return decodeURIComponent(s.replace(/\+/g, " "));
    };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split('&');

    _.each(keyValues, function(v, vi) {
      var key = v.split('=');
      if (key.length > 1) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    });

    return assoc;
  };

  return helpers;
});


define('text!templates/application.underscore',[],function () { return '<div class="application-container">\n  <div class="message-container"></div>\n\n  <div class="content-container">\n\n    <div class="initial loading-block"></div>\n\n    <div id="green-line-story-map" class="storymap"></div>\n\n  </div>\n\n  <div class="footnote-container">\n    <div class="footnote">\n      <p>Some map data © OpenStreetMap contributors; licensed under the <a href="http://www.openstreetmap.org/copyright" target="_blank">Open Data Commons Open Database License</a>.  Some map design © MapBox; licensed according to the <a href="http://mapbox.com/tos/" target="_blank">MapBox Terms of Service</a>.  Some code, techniques, and data on <a href="https://github.com/minnpost/minnpost-green-line-story-map-part-2" target="_blank">Github</a>.</p>\n\n    </div>\n  </div>\n</div>\n';});


define('text!templates/fallback.underscore',[],function () { return '<div class="fallback-content">\n\n  <% _.each(storymap.slides, function(s, si) { %>\n\n    <div class="slide cf <%= (s.type) ?  s.type : \'\' %>">\n      <% if (s.media) { %>\n        <div class="image-group">\n          <img src="<%= s.media.url %>" />\n          <div class="caption"><%= s.media.credit %></div>\n        </div>\n      <% } %>\n\n      <div class="text-group">\n        <h3><%= s.text.headline %></h3>\n\n        <%= s.text.text %>\n      </div>\n    </div>\n\n  <% }); %>\n\n</div>\n';});


define('text!../data/story-map.json',[],function () { return '{\n  "storymap": {\n    "slides": [\n      {\n        "type": "overview",\n        "text": {\n          "headline": "",\n          "text": "<p>When you\'re not toting a briefcase or late for a meeting, each of the 18 stations along the Green Line has its own quirky, pause-worthy reason to get off and take a look around.</p><p><a href=\'//www.minnpost.com/stroll/2014/06/hockey-hip-hop-and-other-green-line-highlights\'>Last week</a>, we highlighted the neighborhoods around stations from the West Bank to Hamline. Here\'s a round-up of the treasures we discovered from Lexington to Bedlam Lowertown &mdash; everything from teeny-tiny train replicas to an iconic copper <em>zwiebelturm</em>, pork-belly sandwiches to die for, and a palm reader who knows all.</p><p>Go ahead: Pull out all the stops.</p>"\n        }\n      },\n\n      {\n        "location": {\n          "name": "Lexington Parkway",\n          "lat": 44.955741,\n          "lon": -93.14661,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Lexington Parkway",\n          "text": "<p><strong>Scale Model Supplies, 458 Lexington Pkwy. N.</strong></p><p>In the back of the strip mall at Lexington and University, on the basement level, you will find this enormous warehouse containing any miniature vehicle you can imagine. Once a bowling alley, Scale Model Supplies carries airplanes, tanks, trains, rockets, slot cars, or anything else that moves. It\'s floor-to-ceiling, and it goes on for aisle after aisle. It seemed like an obvious question, but I couldn\'t help but ask it: in fact, yes they do carry model Siemens Light Rail Vehicles, the rolling stock used on the Green Line. There are no Metro Transit decals, but they\'ll sell you the Testors enamel to paint it blue and yellow yourself. Scale Model Supplies also carries Northstar Line-branded Motive Power MP36PH-3C engines and Bombardier BiLevel Coaches, should you be working on a model railroad setup of every commuter train in use in the seven-county metro.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]10-lexington.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Victoria Street",\n          "lat": 44.955721,\n          "lon": -93.136478,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Victoria Street",\n          "text": "<p><strong>Fatima Spiritual Psychic, 822 University Av. W.</strong></p><p>Fatima has been reading Tarot and palms for more than 40 years in this century-old frame house on University. In fact, her son may usher you into the house through the front door, which was the case when I visited. The inside of the house looks like the sort of cozy, wall-papered home you might expect, with religious imagery of all kinds &mdash; statues, framed prints, icons. There\'s a table right by the door, with candles, a Tarot deck, and other items, where Fatima will pull you up a seat. It\'s about $65 for a full reading, and you can get your palm read for significantly less. You don\'t tell her anything before starting. You don\'t need to.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]11-victoria.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Dale Street ",\n          "lat": 44.955717,\n          "lon": -93.12629,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Dale Street ",\n          "text": "<p><strong>Church of St. Agnes, 548 Lafond Av.</strong></p><p>The copper <em>zwiebelturm</em> (onion tower) of St. Agnes looms over Frogtown like little else in this section of the city. It\'s one of the first things you see coming off the platform, towering over the roofs of the rows of houses on Edmund, Charles and Sherburne north of University Avenue. Built by German and Eastern European immigrants in the early 20th century in the style of an Austrian abbey church, it seems largely unchanged since that time. As would have been the case then, there is a Latin Mass every Sunday. The four enormous bells in the tower toll, signaling the Mass &mdash; a sound easily heard from the anywhere in the neighborhood.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]12-dale.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Western Avenue",\n          "lat": 44.95577,\n          "lon": -93.116131,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Western Avenue",\n          "text": "<p><strong>Ha Tien Market, 353 University Av. W.</strong></p><p>The fa&ccedil;ade at Ha Tien grocery store &mdash; glass blocks, theater marquee &mdash; suggests that it must have been an old movie house at one time. It wasn\'t. In fact, it was built in the art deco-ish style in 1986 to house the Frogtown Diner, a retro eatery that came in at the wrong end of the decade-long &ldquo;Happy Days&rdquo; craze. Ha Tien is one of the established Southeast Asian groceries in this stretch of University Avenue\'s Little Mekong district, operated by the Dao family since the mid-1990s. The inside is a bustling grocery and deli, highly regarded for its banh mi. I was particularly jealous of a good-looking pork belly sandwich the man behind me in line had. He was a regular who lived a few blocks away. &ldquo;The owner picked this out for me himself,&rdquo; he said. &ldquo;So I know it\'s perfect. Cut this into cubes, and it just melts. Throw it in with some basmati rice and Worcestershire sauce, and you\'ve got dinner.&rdquo;</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]13-western.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Rice Street",\n          "lat": 44.955641,\n          "lon": -93.10507,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Rice Street",\n          "text": "<p><strong>Leif Erikson statue</strong></p><p>There is an interesting theory on the Scandinavian side of my friends Stu and Mel\'s family about this 13-foot-high statue of Leif Erikson, sculpted in 1949 by John K. Daniels. The fact that Leif Erikson faces west, away from Norway and away from home, is a terrible violation of the Norwegian idea of <em>hjemkomst</em>, or <em>homecoming</em>. Leif is in this new world, the story goes, but to be placed here turning his back on his homeland can only bring ill tidings. Take, for example, the statue of the Swedish chronicler of the immigrant experience Vilhelm Moberg in Lindstrom, Minnesota. Moberg stands with his bike, but his head is turned east, toward home, as it should be. Until Erikson faces east, back toward Scandinavia, the Minnesota Vikings, named in honor of his people, will never win a Super Bowl. Or so Mel\'s father says.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]14-rice.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Robert Street",\n          "lat": 44.954117,\n          "lon": -93.097604,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Robert Street",\n          "text": "<p><strong>National Guard Armory, 600 Cedar St.</strong></p><p>You can find a small museum experience anywhere you\'re willing to look for it, no matter how unlikely the setting may seem. The National Guard Armory fits the bill. A really striking modernist glass-and-steel building built in 1962, it bears all the imprints of the post-WWII, pre-Vietnam era in American civic life: confidence, technocratic optimism, a dollop of self-importance, down to those lathe-cut metal capital letters spelling out the name out front. The entry hall is quite impressive, with an array of historic and revolutionary flags flying overhead, a brief history lesson in American vexillology. Not just the greatest hits, like the Bennington and Moultrie, but some of the more arcane selections, too, like one of my personal favorites, General Washington\'s pine tree standard.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]15-robert.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Tenth Street",\n          "lat": 44.950722,\n          "lon": -93.097624,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Tenth Street",\n          "text": "<p><strong>Church of Scientology, 505 Wabasha St.</strong></p><p>It is difficult to believe now that the old Science Museum of Minnesota expansion, built in 1978, could have ever housed anything other than the Church of Scientology, which acquired the building a few years ago. Sitting kitty-corner to the Fitzgerald Theater, the imposing quality of the rounded, front-facing fa&ccedil;ade seems built for it, emblazoned with the S-and-two-triangles Scientology emblem and flanked by banners. The central location in a sleepy district of downtown St. Paul, within range of Keillor\'s home base, the State Capitol, and the ivy-covered churches and apartments around it, makes the structure appear all the more theatrical and unapologetically assertive. Outside on the sidewalk there are offers for the public programming within the vast interior space &mdash; including, of course, the opportunity to take a personality test.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]16-tenth.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Central Business District",\n          "lat": 44.946097,\n          "lon": -93.092241,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Central Business District",\n          "text": "<p><strong>St. Paul Athletic Club, 340 Cedar St.</strong></p><p>The St. Paul Athletic Club looks like one of those places that you shouldn\'t be able to walk into, but you can. Or at least you can walk through the lobby and lower levels, all of which are an impossibly lavish complex of dark wood, chandeliers, and fireplaces. (Have you noticed, actually, that most of those I-shouldn\'t-be-allowed-to-be-here-but-here-I-am sorts of places tend to be in St. Paul? This is the sort of amenity, it occurred to me, that explains why people love living in St. Paul.) The plasterwork, ornamentation and other details throughout are enough to make you consider signing up for a membership and begin training for the 1920 Summer Olympics in Antwerp. You can enter directly from the platform-to-skyway link, which is convenient, but you miss the thrill of entering through the front lobby.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]17-central.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "location": {\n          "name": "Union Depot",\n          "lat": 44.948209,\n          "lon": -93.086795,\n          "zoom": 16,\n          "line": true\n        },\n        "text": {\n          "headline": "Union Depot",\n          "text": "<p><strong>Bedlam Lowertown, 213 E. Fourth St.</strong></p><p>The end of the line. You may remember the old Bedlam Theater space, located right by the Cedar-Riverside station on the Blue Line from 2006 to 2010 &mdash; it was one of the best gathering places in Minneapolis, and its absence stung. But that\'s all over! Using the same bar/restaurant/social club/performance space model, Bedlam Lowertown opened this month with a full bar, menu and calendar of upcoming events. The interior has been impressively renovated, and there\'s even one of those great Lowertown alleys behind the space. Bedlam is open until 2 a.m. every night, and the train runs 24 hours a day. See you there.</p>"\n        },\n        "media": {\n          "url": "[[[IMAGE_PATH]]]18-union_depot.jpg",\n          "credit": "MinnPost photo by Carrie Thompson",\n          "caption": ""\n        }\n      },\n\n      {\n        "type": "overview",\n        "text": {\n          "headline": "",\n          "text": "<p>Curious about the <strong>other new stops on the Green Line</strong>? Check out <a href=\'//www.minnpost.com/stroll/2014/06/hockey-hip-hop-and-other-green-line-highlights\'>last week\'s Stroll</a>.</p>"\n        }\n      }\n    ]\n  }\n}\n';});

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

