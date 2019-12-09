let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let path = require("path");
let Device = require("../models/device");
let Measurement = require("../models/measurement");
let User = require("../models/users");
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
    }

    if( !req.body.hasOwnProperty("timeReported") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    */
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
               
             //Create a new measurement and save the measurement to the database
                 var measurement = new Measurement({
                     loc: [req.body.longitude, req.body.latitude],
                     speed: req.body.speed,
                     uv: req.body.uv,
                     timeReported: Date.now(),
                     deviceId: req.body.deviceId,
                     index: req.body.index 
                 });
                 responseJson.message = "New measurement recorded.";
                            

             // Save the measurement data. 
             measurement.save(function(err, newMeasurement) {
                 if (err) {
                     responseJson.status = "ERROR";
                     responseJson.message = "Error saving data in db." + err;
                     return res.status(201).send(JSON.stringify(responseJson));
                 }
                 
                 responseJson.success = true;
                 return res.status(201).send(JSON.stringify(responseJson));
            }); 
            
            //Check to see if activity started and create new activity
            if(measurement.index = "start" ){
                
                //Create a new activity and save the activity to the database
                let activityStartTime = measurement.timeReported;
                let activity = new Activity({
                    timeStart: activityStartTime,  
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
            }
            
            //Check to see if activity ended and set end time
            if(measurement.index = "end" ){
                Activity.update({ "timeStart": { $eq : activityStart } },
                { $set: { "timeStop": measurement.timeReported }}, 
                function(err, status) {
                    console.log("Documents updated: " + status.nModified);
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
    

    // Find all measurements reported in the spcified number of days
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

            // Find all measurements within activity duration
            let measurementQuery = Measurement.find({
                $and: [{ timeReported: { $gte: newActivity.timeStart } }, { timeReported: { $lte: newActivity.timeStop } }]               

            }).sort({ "timeReported": -1 });
            measurementQuery.exec({}, function(err, recentMeasurements) {
                if (err) {
                    responseJson.success = false;
                    responseJson.message = "Error accessing measurement db.";
                    return res.status(200).send(JSON.stringify(responseJson));
                }

                //Calculate Average Speed 

            });
            
            // Add measurement data to the respone's measurements array
            numActivities++; 
            responseJson.activities.push({                 
                type:   newActivity.type,       
                avgUv:  newActivity.avgUv,          
                avgSpeed:   newActivity.avgSpeed,             
                avgTemperture:  newActivity.avgTemperture,  
                avgHumidity:    newActivity.avgHumidity,    
                timeStart:  newActivity.timeStart,       
                timeStop:   newActivity.timeStop,                    
            });
        }
        responseJson.message = "In the past " + days + " days, you've done " + numActivities + " activities!";
        return res.status(200).send(JSON.stringify(responseJson));
    
    });
});


module.exports = router;
