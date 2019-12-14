var db = require("../db");

var activitySchema = new db.Schema({
    type:          String,
    avgSpeed:       Number,
    avgUV:          Number,
    calsBurned:     Number,
    deviceId:       String,
    created:   { type: Date, default: Date.now },
    measurement: [{
        loc:            [{ type: [Number], index: '2dsphere'}],
        uv:             Number,
        speed:          Number,
        timeReported:   { type: Date, default: Date.now }, 
        index:          Number
    }],     
    temperture:  Number,
    humidity:    Number    
});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
