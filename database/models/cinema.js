const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const cinemaSchema = new Schema({
    status: {
        type: Boolean,
        required: true
    }, 
    slug: {
        type: String,
        required: true
    },citySlug: {
        type: String,
        required: true
    },name: {
        type: String,
        required: true
    },tags: {
        type: [String],
        required: true
    }
    ,hasPmrService: {
        type: Boolean,
        required: true
    },theaters: [
        {
            name: {
                type: String,
                required: true
            }, addressLine1: {
                type: String,
                required: true
            }, addressLine2: {
                type: String,
                required: true
            }, addressZip: {
                type: String,
                required: true
            }, addressCity: {
                type: String,
                required: true
            }, gpsPosition: {
                x: {
                    type: Number,
                    required: true
                }, y: {
                    type: Number,
                    required: true
                }
            }
        }
    ],
    hallCount: {
        type: Number,
        required: true
    }, seatCount: {
        type: Number,
        required: true
    }, backdrop: {
        type: String,
        required: true
    },comment: {
        type: String,
    }, refImageItinerary: {
        type: String,
        required: true
    }, description: {
        type: String,
        required: true
    }, refCCS: {
        type: Number,
        required: true
    }, googleMyBusinessUrl: {
        type: String,
        required: true
    }
    
});

const Cinema = mongoose.model("Cinemas", cinemaSchema, "Cinemas");

module.exports = { Cinema };