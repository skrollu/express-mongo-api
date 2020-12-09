var mongoose = require("mongoose");
var Schema = mongoose.Schema;


function canBeRequired(value) {
    if(value != undefined && value != null && !value.isEmpty())  {
        return true;
    } else {
        return false;
    }
}

var MovieSchema = new Schema({
    actors: {
        type: [String],
    },
    awards: {
        nominations: {
            type: Number,
            required: canBeRequired(this.awards),
        }, 
        text: {
            type: String,
            required: canBeRequired(this.awards),
        },
        wins: {
            type: Number,
            required: canBeRequired(this.awards),
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
            required: canBeRequired(this.imdb),
        },
        rating: {
            type: Number,
            required: canBeRequired(this.imdb),
        },
        votes: {
            type: Number,
            required: canBeRequired(this.imdb),
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
        required: false,
        consensus: {
            type: String,
            required: canBeRequired(this.tomato),
        },
        fresh: {
            type: Number,
            required: canBeRequired(this.tomato),
        },
        image: {
            type: String,
            required: canBeRequired(this.tomato),
        },
        meter: {
            type: Number,
            required: canBeRequired(this.tomato),
        },
        rating: {
            type: Number,
            required: canBeRequired(this.tomato),
        },
        reviews: {
            type: Number,
            required: canBeRequired(this.tomato),
        },
        userMeter: {
            type: Number,
            required: canBeRequired(this.tomato),
        },
        userRating: {
            type: Number,
            required: canBeRequired(this.tomato),
        },
        userReviews: {
            type: Number,
            required: canBeRequired(this.tomato),
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