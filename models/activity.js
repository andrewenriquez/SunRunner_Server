var db = require("../db");

var activitySchema = new db.Schema({
    type:          String,
    deviceId:       String,
    measurement: [{
        loc:            [{ type: [Number], index: '2dsphere'}],
        uv:             Number,
        speed:          Number,
        timeReported:   { type: Date, default: Date.now }, 
    }],     
    temperture:  Number,
    humidity:    Number,    
});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;

