const express = require("express");
const models = require("../database/models");
const router = express.Router();
const { Movie } = require('../database/models/movie')
const mongoose = require('mongoose');
const { isAdmin, isAuthenticated } = require('../middlewares/authMiddlewares');

/**
* @Route /api/movies
* @Access PUBLIC
* @Request GET
*/
router.get("/", function (req, res) {
  models.Movie.find({}, (err, movies) => {
    if (err) {
      //console.log("Error while searching for all movies " + err);
      res.status(400).json({
        error: "Error while searching for all movies " + err
      });
    } else {

      /**
       * Ne marche pas vraiment...
       */
      movies.sort((a, b) => {
        b.title - a.title
        console.log(a.title)
      });
      
      res.json({
        movies
      });
    }
  });
}); 

/**
* @Route /api/movies/:id
* @Access PUBLIC
* @Request GET
*/
router.get("/:id", function (req, res) {
  const id = req.params.id;
  
  models.Movie.findById({ _id: id}, (err, movie) => {
    if (err) {
      //console.log("Error while searching for movie " + err);
      res.status(400).json({
        error: "Error while searching for movie " + err
      });
    } else {
      res.json({
        movie
      });
    }
  });
});

/**
* @Route /api/movies/add
* @Access PRIVATE
* @Request POST
*/
router.post("/add", isAdmin, /* upload.array('adPictures'),  */function (req, res) {
  /* 
  const filenames = [];
  req.files.map(file => filenames.push(file.filename))
  */
  
  const data = req.body;
  //console.log(data)
  
  let newAwards = {};
  let newImdb = {};
  let newTomato = {};
  
  if( data.awards ) {
    newAwards = {
      nominations: data.awards.nominations,
      text: data.awards.text,
      wins: data.awards.wins,
    }
  }
  
  if( data.imdb ) {
    newImdb = {
      id:  data.imdb.id,
      rating:  data.imdb.rating,
      votes:  data.imdb.votes,
    }
  }
  
  if( data.tomato ) {
    newTomato = {
      consensus: data.tomato.consensus,
      fresh: data.tomato.fresh,
      image: data.tomato.image,
      meter: data.tomato.meter,
      rating: data.tomato.rating,
      reviews: data.tomato.reviews,
      userMeter: data.tomato.userMeter,
      userRating: data.tomato.userRating,
      userReviews: data.tomato.userReviews,
    }
  }
  const newMovie = new Movie({
    actors: data.actors,
    awards: newAwards,
    countries: data.countries,
    director: data.director,
    genres: data.genres,
    imdb: newImdb,
    metacritic: data.metacritic,
    plot: data.plot,
    poster: data.poster,
    rated: data.rated,
    runtime: data.runtime,
    title: data.title,
    tomato: newTomato,
    type: data.type,
    writers: data.writers,
    year: data.year,
    youtubeEmbedUrl: data.youtubeEmbedUrl
  });
  
  newMovie.save()
  .then((movie) => res.json({
    added: true,
    movie: movie
  }))
  .catch((e) => {
    console.log("Error when adding new movie: " + e);
    res.json({
      added: false,
      error: e
    })
  });
});

/**
* @Route /api/movies/delete/:_id
* @Access PRIVATE
* @Request DELETE
*/
router.delete("/delete/:id", isAdmin, function (req, res) {
  let id = req.params.id;
  
  if (mongoose.Types.ObjectId.isValid(id)) {
    Movie.findOneAndRemove({ _id: id })
    .then((movie, err) => {
      if (movie) {
        //file found
        res.json({
          deleted: true,
          movie: movie
        });
      } else {
        //file not found
        res.status(400).json({
          deleted: false,
          error: err
        });
      }
    })
    .catch((err) => {
      // error during method
      console.log(err);      
      res.status(400).json({
        deleted: false,
        error: err
      });
    });
  }
});

/**
* @route /movies/update/:id
* @access PRIVATE
* @request PUT
*/
router.put("/update/:id", isAdmin, function (req, res) {
  const id = req.params.id;
  const data = req.body;
  
  if(id === null || id === undefined) {
    res.status(400).json({
      updated: false,
      error: "ERROR: No id sended, which movie do you want to update ?"
    })
  } else if(Object.keys(data).length === 0 && data.constructor === Object){
    res.status(400).json({
      updated: false,
      error: "ERROR: No data sended, impossible to update movie..."
    })
  } else {
    
    //req.files.map((file) => ad.picturesPath.push(file.filename));
    
    let newAwards = {};
    let newImdb = {};
    let newTomato = {};
    
    if( data.awards ) {
      newAwards = {
        nominations: data.awards.nominations,
        text: data.awards.text,
        wins: data.awards.wins,
      }
    }
    
    if( data.imdb ) {
      newImdb = {
        id:  data.imdb.id,
        rating:  data.imdb.rating,
        votes:  data.imdb.votes,
      }
    }
    
    if( data.tomato ) {
      newTomato = {
        consensus: data.tomato.consensus,
        fresh: data.tomato.fresh,
        image: data.tomato.image,
        meter: data.tomato.meter,
        rating: data.tomato.rating,
        reviews: data.tomato.reviews,
        userMeter: data.tomato.userMeter,
        userRating: data.tomato.userRating,
        userReviews: data.tomato.userReviews,
      }
    }
    const newMovie = new Movie({
      _id: id,
      actors: data.actors,
      awards: newAwards,
      countries: data.countries,
      director: data.director,
      genres: data.genres,
      imdb: newImdb,
      metacritic: data.metacritic,
      plot: data.plot,
      poster: data.poster,
      rated: data.rated,
      runtime: data.runtime,
      title: data.title,
      tomato: newTomato,
      type: data.type,
      writers: data.writers,
      year: data.year,
      youtubeEmbedUrl: data.youtubeEmbedUrl
    });
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      Movie.findByIdAndUpdate(id, { $set: newMovie }, { new: true }) //in order to return the new value and not the old
      .then((movie) => {
        if (movie) {
          res.json({
            updated: true,
            movie
          })
        } else {
          res.status(400).json({
            updated: false,
            movie
          })
        }
      })
      .catch((err) => {
        console.log(err)
        res.status(400).json({
          updated: false,
          error: err
        })
      });
    }
  }
});

module.exports = router;
