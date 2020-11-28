var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MovieSchema = new Schema({
    _id: {
        type: mongoose.ObjectId,
        required: true
    },
    actors: {
        type: [String],
    },
    awards: {
        nominations: {
            type: Number,
            required: true,
        }, 
        text: {
            type: String,
            required: true,
        },
        wins: {
            type: Number,
            required: true,
        },
    },
    countries: {
        type: [String],
    },
    director: {
        type: String,
        required: true,
    },
    genres: {
        type: [String],
    },
    imdb: {
        id: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        votes: {
            type: Number,
            required: true,
        },
    },
    metacritic: {
        type: String,
    },
    plot: {
        type: String,
        required: true,
    },
    poster: {
        type: String,
        required: true,
    },
    rated: {
        type: String,
        required: true,
    },
    runtime: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    tomato: {
       consensus: {
            type: String,
            required: true,
        },
        fresh: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        meter: {
            type: Number,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        reviews: {
            type: Number,
            required: true,
        },
        userMeter: {
            type: Number,
            required: true,
        },
        userRating: {
            type: Number,
            required: true,
        },
        userReviews: {
            type: Number,
            required: true,
        },
    },
    type: {
        type: String,
        required: true,
    },
    writers: {
        type: [String],
    },
    year: {
        type: Number,
        required: true,
    },
    youtubeEmbedUrl: {
        type: String,
    }
});

const Movie = mongoose.model("Movies", MovieSchema, "Movies");

module.exports = { Movie };