var db = require("../db");

var potholeSchema = new db.Schema({
    loc:           { type: [Number], index: '2dsphere'},
    totalHits:     Number,
    zip:           String,
    uv:            Number,
    gpsSpeed:      Number,
    lastReported:  { type: Date, default: Date.now },
    firstReported: { type: Date, default: Date.now }
});

var Pothole = db.model("Pothole", potholeSchema);

module.exports = Pothole;
