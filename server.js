

//Dependencies
var express = require("express");
var mongojs = require("mongojs")

var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

//Require Request and Cheerio and Axios
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request")

// Require all models
var db = require("./models");

var PORT = 3000;


// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
//app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/Article");

  
// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request for the news section of `espnsoccer`
  axios.get("http://www.espn.com/soccer/").then(function (response) {

    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".contentItem__content").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });

});


app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
  
  
  // Listen on port 3000
  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
  