let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let path = require("path");
let Device = require("../models/device");
let Activity = require("../models/activity"); 

// Secret key for JWT
let secret = "superSecret";
//var secret = fs.readFileSync(path.join(__dirname, '../..', 'jwtkey')).toString();
let authenticateRecentEndpoint = true;

function authenticateAuthToken(req) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return null;
    }
   
    let authToken = req.headers["x-auth"];
   
    try {
        let decodedToken = jwt.decode(authToken, secret);
        return decodedToken;
    }
    catch (ex) {
        return null;
    }
}
/*
function makeWeatherRequest(err, ){
    //Get weather information
    var zip = 90210;
    request({
      method: "GET",
      uri: "http://api.openweathermap.org/data/2.5/weather",
      qs: {
         zip: zip,
         units: "imperial",
         appid: "APIKEY"
      }
    }, function(error, response, body) {
        var data = JSON.parse(body);                
        var locals = {
         data: data, 
         zip: zip
        };
        res.render("weather", locals);
    });
}
*/

// POST: Adds reported measurement and new activity to the database
// Authentication: APIKEY. The device reporting must have a valid APIKEY
router.post("/hit", function(req, res) {
    let responseJson = {
        success : false,
        message : "",
    };

    // Ensure the POST data include required properties                                               
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.message = "Request missing deviceId parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.message = "Request missing apikey parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("longitude") ) {
        responseJson.message = "Request missing longitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.message = "Request missing latitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    /*
    if( !req.body.hasOwnProperty("timeReported") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }*/

    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.message = "Request missing speed parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("index") ) {
        responseJson.message = "Request missing index parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    // Find the device in DB and VERIFY the apikey                                           
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
            return res.status(201).send(JSON.stringify(responseJson));
        }
        
        if (device.apikey != req.body.apikey) {
            responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
            return res.status(201).send(JSON.stringify(responseJson));
        }
               
             
            
        //Check to see if activity started and create new activity
        if(req.body.index = "start" ){       

            //Create a new activity and save the activity to the database            
            let activity = new Activity({                
                //type:          String,
                //temperture:  Number,
                //humidity:    Number,
                deviceId:       req.body.deviceId,
                measurement: [{
                    loc:            [req.body.longitude, req.body.latitude],
                    uv:             req.body.uv,
                    speed:          req.body.speed,
                    timeReported:   Date.now(), 
                }],     
                 
            });
            responseJson.message = "New activity recorded.";                        

            // Save the activity data. 
            activity.save(function(err, newActivity) {
                if (err) {
                    responseJson.status = "ERROR";
                    responseJson.message = "Error saving data in db." + err;
                    return res.status(201).send(JSON.stringify(responseJson));
                }
                
                responseJson.success = true;
                return res.status(201).send(JSON.stringify(responseJson));
            }); 

            //Save start time for reference
            var activityStartTime = new Date(activity.measurement.timeReported);
        }


        //Check to see if activity continue
        if(req.body.index = "continue" ){                

            //Add to measurement data array
            Activity.findOne( {$eq : activityStartTime})
            .update({ $push: { "measurement": {
                        loc:            [req.body.longitude, req.body.latitude],
                        uv:             req.body.uv,
                        speed:          req.body.speed,
                        timeReported:   Date.now(),
                        }
                    }
            })             
            .exec(function(err, status) {
                console.log("Documents updated: " );
             });                      
           
        }
        

        //Check to see if activity ended and set end time
        if(req.body.index = "end" ){
            //Add to measurement data array
            Activity.findOne({ "measurement[0].timeReported": { $eq : activityStartTime } })
            .update({ $push: { "measurement": {
                        loc:            [req.body.longitude, req.body.latitude],
                        uv:             req.body.uv,
                        speed:          req.body.speed,
                        timeReported:   Date.now(),
                        }
                    }
            })
            .update({ $set: {"timeStop":  Date.now() }})             
            .exec(function(err, status) {
                console.log("Documents updated: ");
             });

        }            

    });
});

// GET: Returns all measurements first reported in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/summary/:days", function(req, res) {
    let days = req.params.days;
    
    let responseJson = {
        success: true,
        message: "",
        activities: [],
    };
    
    //Authenticate User
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    
    
    // Check to ensure the days is between 1 and 30 (inclsuive), return error if not
    if (days < 1 || days > 30) {
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(200).json(responseJson);
    }
    

    // Find all activities reported in the spcified number of days
    let activityQuery = Activity.find({
        "timeStop": 
        {
            $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)))
        },

    }).sort({ "timeStop": -1 });    
    
    activityQuery.exec({}, function(err, recentActivities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing activity db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
        
        //Create list of activity data     
        let numActivities = 0;           
        for (let newActivity of recentActivities) { 

            // Add measurement data to the respone's measurements array
            numActivities++; 
            responseJson.activities.push({
                deviceId:       newActivity.deviceId,
                //temperture:  Number,
                //humidity:    Number,
                measurement: [{
                    loc:            [newActivity.longitude, newActivity.latitude],
                    uv:             newActivity.uv,
                    speed:         newActivity.speed,
                    timeReported:  newActivity.timeReported, 
                }],                    
              
            });
        }
        responseJson.message = "In the past " + days + " days, you've done " + numActivities + " activities!";
        return res.status(200).send(JSON.stringify(responseJson));
    
    });
});


module.exports = router;
