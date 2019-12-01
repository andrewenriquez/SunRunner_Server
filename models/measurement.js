var db = require("../db");

var measurementSchema = new db.Schema({
    loc:            { type: [Number], index: '2dsphere'},
    uv:             Number,
    speed:          Number,
    dateReported:   { type: Date, default: Date.now },
    deviceId:       String
});

var Measurement = db.model("Measurement", measurementSchema);

module.exports = Measurement;

