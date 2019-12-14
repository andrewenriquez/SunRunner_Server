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

function requestWeather(location){
    //Get weather information
    //var APIKEY = fs.readFileSync(path.join(__dirname, '../..', 'weatherAPI')).toString();
	var APIKEY = f5b6d09e13c1b21fdff87955482ee698; 
    request({
      method: "GET",
      uri: "http://api.openweathermap.org/data/2.5/weather",
      qs: {
        lon= location[0],
        lat=location[1],        
         units: "imperial",
         appid: APIKEY
      }
    }, function(error, response, body) {
        if(error){
            var weather = {
                temp: 0, 
                humidity: 0
            };
            return (weather);
        }

        var data = JSON.parse(body);                
        var weather = {
            temp: data.main.temp, 
            humidity: data.main.humidity
        };
        return (weather);
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
            
            //look for the most recent activity based off of time.
            let findActivityQuery = Activity.findOne( {  deviceId: req.body.deviceId  })
            .sort({ "created": "desc" });


            findActivityQuery.exec(function(err, activity) {
                if (err) {
                    responseJson.status = "ERROR";
                    responseJson.message = "Error updatting data in db." + err;
                    return res.status(401).send(JSON.stringify(responseJson));
                }
                
                // if the activity is not null and the index in the post request is greater than the last element in
                // the activity measurements array, add the post request object to said array.
                if (activity != null && req.body.index > activity.measurement[activity.measurement.length - 1].index) {
                    //let numActivities = 0;

                        let sumSpeed = parseFloat(req.body.speed);
                        let sumUV = parseFloat(req.body.uv);
                        let numMeasurements = 1;

                        //calculating averages and adding them to activity database.
                        for (let measurements of activity.measurement) {

                            sumSpeed += measurements.speed;
                            sumUV += measurements.uv;
                            numMeasurements++;
                        
                        }
                        // Add measurement data to the respone's measurements array
                        activity.avgUV = sumUV / numMeasurements;
                        activity.avgSpeed = sumSpeed / numMeasurements;
                    activity.measurement.push(
                        {
                            loc:            [req.body.longitude, req.body.latitude],
                            uv:             req.body.uv,
                            speed:          req.body.speed,
                            index:          req.body.index,
                            timeReported:   Date.now(),
                            }
                        

                    );
                    /**This just does determines what the activity is based on the speed. We should change this. */
                    if (activity.avgSpeed >= 10.0) {
                        activity.type = "Biking";
                        let MET = 9.5;   
                        let weight = 70;   //Avg weight in kg
                        let durationMin =  activity.duration/60;
                        activity.calsBurned =  (durationMin*MET*3.5*weight)/200;
                    }
                    else if (activity.avgSpeed < 10.0 && activity.avgSpeed >= 5.0) {
                        activity.type = "Running";
                        let MET = 9.8;
                        let weight = 70;   //Avg weight in kg
                        let durationMin =  activity.duration/60;
                        activity.calsBurned =  (durationMin*MET*3.5*weight)/200;
                    }
                    else {
                        activity.type = "Walking";
                        let MET = 3.8;
                        let weight = 70;   //Avg weight in kg
                        let durationMin =  activity.duration/60;
                        activity.calsBurned =  (durationMin*MET*3.5*weight)/200;
                    }
                    /**Just a simple response to make sure everything is working. Greate for testing with JSON POSTer Utility. */
                    responseJson.message = "Activity ["+activity.type+"]. New activity recorded. Total measurements for activity "+
                    activity._id+" is "+activity.measurement.length;
                    
            
                   
                }
                //if the post req has an index value of 0, then we should consider this a new activity and record the start time
                //saving it to the "created" field in the new activity mongo document.
                else if (req.body.index == "0"){
                    var activity = new Activity({                
                        //type:          String,
                        //temperture:  Number,
                        //humidity:    Number,
                        avgSpeed:       req.body.speed,
                        avgUV:          req.body.uv,
                        deviceId:       req.body.deviceId,
                        created:        Date.now(),
                        measurement: [{
                            loc:            [req.body.longitude, req.body.latitude],
                            uv:             req.body.uv,
                            speed:          req.body.speed,
                            index:          req.body.index,
                            timeReported:   Date.now() //this needs to be done on the device and sent over
                        }],     
                         
                    });
                /**This just does determines what the activity is based on the speed. We should change this. */
                    if (activity.avgSpeed >= 10.0) {
                        activity.type = "Biking";
                        let MET = 9.5;   
                        let weight = 70;   //Avg weight in kg
                        let durationMin =  activity.duration/60;
                        activity.calsBurned =  (durationMin*MET*3.5*weight)/200;
                    }
                    else if (activity.avgSpeed < 10.0 && activity.avgSpeed >= 5.0) {
                        activity.type = "Running";
                        let MET = 9.8;
                        let weight = 70;   //Avg weight in kg
                        let durationMin =  activity.duration/60;
                        activity.calsBurned =  (durationMin*MET*3.5*weight)/200;
                    }
                    else {
                        activity.type = "Walking";
                        let MET = 3.8;
                        let weight = 70;   //Avg weight in kg
                        let durationMin =  activity.duration/60;
                        activity.calsBurned =  (durationMin*MET*3.5*weight)/200;
                    }

                    //Get current weather for location and save temp & humidity
                    let temp = requestWeather(activity.measurement.loc).temp;
                    let humidity = requestWeather(activity.measurement.loc).humidity;
                    activity.temperture = temp;
                    activity.humidity = humidity;
                    
                    responseJson.message = "New activity recorded. Activity ID is "+
                    activity._id;   

                }
                //This should take care of measurements that might be duplicates or lagging. They won't be saved.
                else {
                    responseJson.message = "No activities changed."; 
                    responseJson.success = true;
                    return res.status(201).send(JSON.stringify(responseJson));
                }
                //save either the new Activity or updated Activity.
                activity.save(function(err) {
                     if (err) {
                     responseJson.status = "ERROR";
                     responseJson.message = "Error saving data in db." + err;
                     return res.status(201).send(JSON.stringify(responseJson));
                 }

                 responseJson.success = true;
                 return res.status(201).send(JSON.stringify(responseJson));
            });
        });                 
    });
});

// GET: Returns all measurements first reported in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/summary", function(req, res) {
    let days = 7;
    
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
    if (days < 1 || days > 7) {
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(200).json(responseJson);
    }
    

    // Find all activities reported in the spcified number of days
    let activityQuery = Activity.find({
        "created": 
        {
            $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)))
        },

    }).sort({ "created": -1 });    
    
    activityQuery.exec({}, function(err, recentActivities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing activity db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
        
        //Create list of activity data     
        let numActivities = 0;
         
             
        for (let newActivity of recentActivities) { 

            //for (measurements of newActivity.measurement) {
            //    speedArray.push(measurements.speed);
                //same uv
            //}

            responseJson.activities.push(
                {
                 deviceId:       newActivity.deviceId,
                 averageSpeed:   newActivity.avgSpeed,
                 averageUV:      newActivity.avgUV,
                 activityType:   newActivity.type,
                 date:           newActivity.created,
                 duration:       newActivity.measurement.length * 15
    
                //temperture:  Number,
                //humidity:    Number,
                //measurement: [{
                //    loc:            [newActivity.longitude, newActivity.latitude],
                //    uv:             newActivity.uv,
                //    speed:         newActivity.speed,
                //    timeReported:  newActivity.timeReported, 
                //}]            
                
                
            }
                
            );

            numActivities++;

        }
        responseJson.message = "In the past " + days + " days, you've done " + numActivities + " activities!";
        return res.status(200).send(JSON.stringify(responseJson));
    
    });
});


router.get("/all", function(req, res) {
    let days = 30;      //MIGHT WANT TO REMOVE OR CHANGE
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

    //Get email of current user     
    let userEmail = decodedToken.email;

    let numActivities = 0;
    // Find all devices for user
    let deviceQuery = Device.find({
        "userEmail": 
        {
            $eq: userEmail
        },

    }).sort({ "lastContact": -1 });

    deviceQuery.exec({}, function(err, recentDevices) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing devices db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
                
        //Loop through devices of user to find all user activities     
        for (let nextDevice of recentDevices) { 

            // Find all user activities
            let activityQuery = Activity.find({ 
                $and:[
                    { "deviceId": { $eq: nextDevice.deviceId } }, 
                    { "created": { $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000))) } }
            ]}).sort({ "created": -1 });    
            
            activityQuery.exec({}, function(err, recentActivities) {
                if (err) {
                    responseJson.success = false;
                    responseJson.message = "Error accessing activity db.";
                    return res.status(200).send(JSON.stringify(responseJson));
                }
                
                    
               
                    
                //Create list of activity data         
                for (let newActivity of recentActivities) { 

                    responseJson.activities.push(
                        {
                            deviceId:       newActivity.deviceId,
                            averageSpeed:   newActivity.avgSpeed,
                            averageUV:      newActivity.avgUV,
                            activityType:   newActivity.type,
                            date:           newActivity.created,
                            duration:       newActivity.measurement.length * 15
            
                        //temperture:  Number,
                        //humidity:    Number,
                        //measurement: [{
                        //    loc:            [newActivity.longitude, newActivity.latitude],
                        //    uv:             newActivity.uv,
                        //    speed:         newActivity.speed,
                        //    timeReported:  newActivity.timeReported, 
                        //}]            
                        
                        
                    }
                        
                    );

                    numActivities++;
                }
                responseJson.message = "In the past " + days + " days, you've done " + numActivities + " activities!";
                return res.status(200).send(JSON.stringify(responseJson));
            
            });
           
        }
        
    
    });    

           

});


router.get("/one/date/activity", function(req, res) {

});

router.post("/changeActivity", function(req, res) {
    
});


module.exports = router;
