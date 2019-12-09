var db = require("../db");

var activitySchema = new db.Schema({
    type:          String,
    avgUv:            Number,
    avgSpeed:         Number,    
    avgTemperture:  Number,
    avgHumidity:    Number,
    timeStart:   { type: Date, default: Date.now },    
    timeStop: { type: Date, default: Date.now }
});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;

