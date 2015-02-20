module.exports = function(options) {

//
// CONFIGURATION
//
var rfcname = options.rfcname || 'Harpoon File Send Server';
var localip = options.localip || '127.0.0.1';
var hosts = options.hosts || ['localhost', '127.0.0.1'];									// Allowed Hosts For Clustering (This should always have localhost and 127.0.0.1)
var peers = options.peers || ['127.0.0.1'];											// Allowed Peers For cluster Peering
var filesDirectory = options.filesDirectory || __dirname + "files/";									// Absolute path with trailing slash or relative path with trailing slash
var port = options.port || 8080;												// Server Port
var maxLag = options.maxLag || 5000;                                                              				// Maximum Wait Time In Milliseconds
var serverSecret = options.serverSecret || "ASaltyPhras3";                                        				// Used For Session Caching
var logging = options.logging || true;                                                             				// Enable or Disable Logging
var basekbps = options.basekbps || 1000;                                                            				// Minimum rate to attempt to send files at in kb
var burstkbps = options.burstkbps || 500;                                                           				// The burst rate for sending files
var exts = options.exts || ['.zip', '.rar', '.7zip', '.png', '.jpg', '.jpeg', '.gif', '.swf', '.flv', '.txt', 'status']; 	// File Types To Protect From Leeching
var picture = options.picture || __dirname + "/files/default.png";                                 				// The image to show when Anti-Leeching kicks in

//
// (!WARNING!) (** Unless You Are A Developer Or Hacking The Code Do Not Edit Past This Point **)
//

//
// PLUGINS
//
require('cluster-server')(port, localip, function() {                           // Worker Threading
var detector = require('spider-detector');                                      // Detects Spiders
var toobusy = require('toobusy-js').maxLag(maxLag);                             // Throttles Server Resources
var express = require('express');
var session = require('express-session');
var cacheResponseDirective = require('express-cache-response-directive');       // Caches Resources
var antiscan = require('express-antiscan');                                     // Prevents Query Scanning
var sqlinjection = require('sql-injection');                                    // Prevents SQL Injections (Not That We Use Any)
var AntiLeech = require('express-anti-leech');                                  // Anti-Leeching
var morgan = require('morgan');                                                 // Logging
var QoS = require("connect-qos");                                               // QoS
var health = require('express-ping');                                           // Health Ping Data
var throttle = require('micron-throttle');                                      // Request Throttle
var PeerStore = require("peer-store");                                          // Session Clustering
var app = express();
var fs = require("fs");
var path = require("path");
var uptimer = require('uptimer');
var requests = 0;
var errors = 0;
var sends = 0;
var toobusy = 0;
var ip = "";
var finishedrequests = 0;

//
// SESSION CLUSTERING
//
if (peers.length>1) {
        var store = new PeerStore({
          peers: peers
        });
}

//
// SESSION HANDLING
//
if (peers.length>1) {
store.getAll(function(data) {
console.log("Session Peering:", data);
});
app.use(session({
  expires: new Date(Date.now() + 86400),
  store: store.sessionStore(),
  secret: serverSecret
}));
} else {
app.use(session({
  expires: new Date(Date.now() + 86400),
  secret: serverSecret,
  resave: false,
  saveUninitialized: true
}));
}

//
// Health Ping
//
app.use(health.ping());

//
// Anti Leech Filter Types
//
app.use(AntiLeech({
  allow: hosts,
  exts: exts,
  log: __dirname + '/logs/leech.log', // you can use your own
  default: picture
}));

//
// FAILING GRACEFULLY
//
process.on('uncaughtException', function (error) {
   console.log(error.stack);
});


//
// REQUEST THROTTLE
//
app.use(throttle({
    burst: burstkbps,
    rate: basekbps,
    ip: true,
    overrides: {
        '127.0.0.1': {
            rate: basekbps*10,        // unlimited
            burst: burstkbps*10
        }
    }
}));

//
// QoS
//
app.use(new QoS({ }));

//
// ANTI SCANN
//
app.use(antiscan());

//
// LOGGING
//
var accessLogStream = "";
if (logging) {
        accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'});
        app.use(morgan('combined', {stream: accessLogStream}));
}

//
// SPIDER DETECTOR MIDDLEWARE
//
app.use(detector.middleware());

//
// SQL INJECTION PREVENTION
//
app.use(sqlinjection);

//
// CACHE DIRECTIVE
//
app.use(cacheResponseDirective());

//
// HARPOON LOAD
//
if (typeof toobusy !="undefined") {
app.use(function(req, res, next) {
  if (req.isSpider()) {
    req.send(404, "File Not Found.");
  }
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!ip) {
    req.send(503, "Missing Client IP Address.");
  }
  if (req.session.views) {
    req.session.views++
  } else {
    req.session.views = 1
  }
  if (!req.session.downloads) {
    req.session.downloads = 0
  }
  if (typeof toobusy == "function") {
    if (toobusy()) {
      res.send(503, "Too busy right now, sorry.");
      toobusy++;
    } else {
      next();
    }
  } else {
      next();
  }
});
}

//
// HARPOON INDEX
//
app.get('/', function(req, res, next) {
        res.json("Hello "+ ip +" This is "+ rfcname +" Version 1.0");
        req.sessionStore.set("lastview","/");
        requests++;
        next();
});

app.get('/heartbeat', function(req, res, next) {
        var date = new Date();
        res.json({
                "Date": date.getTime(),
                "Uptime": uptimer.getAppUptime(),
        });
        req.sessionStore.set("lastview","/heartbeat");
console.log(session.session);

        requests++;
        next();
}),

app.get('/status', function(req, res, next) {
        res.json({
                "Server": rfcname +"Version 1.0",
                "Uptime": uptimer.getAppUptime(),
                "Port": port,
                "MaxLag": maxLag,
                "Requests": requests,
                "Finished Requests": finishedrequests,
                "Sends": sends,
                "Errors": errors,
                "Too Busy": toobusy,
                "Session Views": req.session.views,
                "Session Downloads": req.session.downloads
        });
        requests++;
        next();
});

app.get('/files/*', function(req, res, next) {
        res.cacheControl({maxAge: 31536000});
        res.download(filesDirectory+req.params[0], path.basename(req.params[0]), function(err) {
          if (err) {
            errors++;
          }
        });
        req.session.downloads++;
        sends++;
        requests++;
        next();
});

//
// HARPOON UNLOAD
//
app.use(function(req, res, next) {
   finishedrequests++;
});

//app.listen(port);
console.log(rfcname +' Worker Listening on port '+ port);

app.on('SIGINT', function() {
  console.log(rfcname +' Closing Down on port '+ port);
  if (typeof toobusy == "function") {
          toobusy.shutdown();
  }
  app.exit();
});

return app;
}); // Close Cluster Server

}