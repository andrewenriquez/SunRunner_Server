var db = require("../db");

var measurementSchema = new db.Schema({

    deviceId:       String,
    loc:            { type: [Number], index: '2dsphere'},
    uv:             Number,
    speed:          Number,
    timeReported:   { type: Date, default: Date.now },    
    index:          String
});

var Measurement = db.model("Measurement", measurementSchema);

module.exports = Measurement;

