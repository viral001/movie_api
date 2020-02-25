const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
const app = express();
const mongoose = require('mongoose');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//Mongoose database connection

//mongoose.set('useFindAndModify', false);
//mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(
    'mongodb+srv://testuser123:fj2389409uK9P@watchr-fg1rx.mongodb.net/Watchr?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
    }
);

//Middleware functions

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Error: Something broke.');
  next()
});

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

//GET request

app.get('/', function(req, res) {
  var responseText = 'Welcome to Watchr. Enjoy!'
  res.send(responseText);
});

//Returns a list of all movies

app.get("/movies", function(req, res) {
  Movies.find()
      .then(function(movies){
        res.status(201).json(movies)
      })
      .catch(function(error){
        console.error(error);
        res.status(500).send("Error" + error);
      });
});

//Returns data about a single movie by title

app.get("/movies/:Title", function(req, res){
  Movies.findOne({Title : req.params.Title})
      .then(function(movies){
        res.status(201).json(movies)
      })
      .catch(function(error){
        console.error(error);
        res.status(500).send("Error" + error);
      });
});

//Returns data about a genre by name

app.get("/movies/genres/:Name", function(req, res){
  Movies.findOne({'Genre.Name' : req.params.Name})
      .then(function(movie){
        res.status(201).send(movie.Genre.Name + '<br>' + movie.Genre.Description)
      })
      .catch(function(error){
        console.error(error);
        res.status(500).send("Error" + error);
      });
});

//Returns data about a director

app.get("/movies/directors/:Name", function(req, res) {
  Movies.findOne({"Director.Name" : req.params.Name})
      .then(function(movies){
        res.status(201).json(movies.Director)
      })
      .catch(function(error){
        console.error(error);
        res.status(500).send("Error" + error);
      });
});

//Get all users

app.get("/users", passport.authenticate('jwt', {session: false}), function(req, res) {

  Users.find()
      .then(function(users) {
        res.status(201).json(users)
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
});

//Allows new users to register

app.post('/users',
    [check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail()],(req, res) => {

      var errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      var hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOne({ Username : req.body.Username })
          .then(function(user) {
            if (user) {
              return res.status(400).send(req.body.Username + " already exists");
            } else {
              Users
                  .create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                  })
                  .then(function(user) {res.status(201).json(user) })
                  .catch(function(error) {
                    console.error(error);
                    res.status(500).send("Error: " + error);
                  });
            }
          }).catch(function(error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
    });

//Get a user by username

app.get("/users/:Username", passport.authenticate('jwt', {session: false}), function(req, res) {
  Users.findOne({ Username : req.params.Username })
      .then(function(user) {
        res.json(user)
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
});

//Allows users to update their user info

app.put("/users/:Username", passport.authenticate("jwt", { session: false }), [check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email','Email does not appear to be valid').isEmail()],(req, res) => {

    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });

    var hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate({
      Username: req.params.Username
    },
    {
      $set: {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  function(error, updatedUser) {
      if (error) {
        console.error(error);
        res.status(500).send("Error " + error);
      } else {
        res.json(updatedUser);
      }
    })
}});


//Allows users to add a movie to their list of favorites

app.post('/users/:Username/movies/:MovieId', passport.authenticate('jwt', {session: false}), function(req, res) {
  Users.findOneAndUpdate({
          Username: req.params.Username
      }, {
        $push: {FavoriteMovies : req.params.MovieId}
      },
      { new : true },
      function(error, updatedUser) {
        if (error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        } else {
          res.json(updatedUser);
        }
      });
});

//Allows users to remove a movie from their list of favorites

app.delete("/users/:username/favorites/:MovieID", passport.authenticate('jwt', {session: false}), function(req, res) {
  Users.findOneAndUpdate({ Username : req.params.Username}, {
        $pull : {MovieFavorites : req.params.MovieID}
      },
      {new: true},
      function(error, updatedUser) {
        if(error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        } else {
          res.status(201).send("Movie ID #"+ req.params.MovieID + " is now removed from favorites.");
        }
      })
});

//Delete a user by username

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), function(req, res) {
  Users.findOneAndRemove({ Username: req.params.Username })
      .then(function(user) {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
});

//Listen for requests

var port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function() {
  console.log("Listening on Port 3000");
});
