let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let path = require("path");
let Device = require("../models/device");
let Activity = require("../models/activity");
let request = require('request'); 

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



 function requestWeather(location, activity){
    //Get weather information
    //var APIKEY = fs.readFileSync(path.join(__dirname, '../..', 'weatherAPI')).toString();
    //var APIKEY = "527303e31c944895fd262ec2c68a5c1d";
    var APIKEY2 = "4913031574b69f29c41a404c564859ee";
    
    let myData = {
        /*
        url: "http://api.openweathermap.org/data/2.5/weather?lat="+location[1]+
        "&lon="+location[0]+"&APPID="+APIKEY,
        */
        url: "https://api.darksky.net/forecast/"+APIKEY2+"/"+location[1]+","+location[0],
        method: 'GET',
    };

    request(myData, function(err, res, body) {
        if (err) {
            console.log("error");
        }

        else if (body) {

            let apiData = JSON.parse(body);

            if (apiData.code == 400) {

                activity.temperture = 400; //kelving to faren
                activity.humidity = 401;
                //return res.status(400).send(JSON.stringify(responseJson));
            }
            
            else {
                activity.temperture = apiData.currently.temperature; //kelving to faren
                activity.humidity = apiData.currently.humidity;
            }

            //return myData;
        }

        activity.save(function(err) {
            if (err) {
            responseJson.status = "ERROR";
            responseJson.message = "Error saving data in db." + err;
            return res.status(201).send(JSON.stringify(responseJson));
        }
    });


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
    
    if( !req.body.hasOwnProperty("lon") ) {
        responseJson.message = "Request missing longitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("lat") ) {
        responseJson.message = "Request missing latitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.message = "Request missing speed parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("time") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("uv") ) {
        responseJson.message = "Request missing uv parameter.";
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
                        let etime = parseInt(req.body.time);
                        etime = new Date(etime * 1000);
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
                            loc:            [req.body.lon, req.body.lat],
                            uv:             req.body.uv,
                            speed:          req.body.speed,
                            index:          req.body.index,
                            timeReported:   etime
                            }
                        

                    );

                    activity.duration = activity.measurement.length * 15;
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

                    let etime = parseInt(req.body.time);
                    etime = new Date(etime * 1000);
                    var activity = new Activity({                
                        //type:          String,
                        //temperture:  Number,
                        //humidity:    Number,
                        

                        avgSpeed:       req.body.speed,
                        avgUV:          req.body.uv,
                        deviceId:       req.body.deviceId,
                        created:        etime,
                        measurement: [{
                            loc:            [req.body.lon, req.body.lat],
                            uv:             req.body.uv,
                            speed:          req.body.speed,
                            index:          req.body.index,
                            timeReported:   etime, //this needs to be done on the device and sent over
                        }],     
                         
                    });
                    activity.duration = activity.measurement.length * 15;
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
                    requestWeather(activity.measurement[0].loc, activity);
                  //requestWeather(activity.measurement[0].loc);
                    
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



/**
 * Replaced /summary with /summary2 because it doesn't need to do a nested call back.
 */
router.get('/summary2', function (req, res) {
    let days = 100;
    
    let responseJson = {
        success : false,
        message : "",
        deviceSize: 0,
        activities : [],
        numActivities: 0,
        totalCals: 0,
        totalUV: 0,
        totalDuration: 0,
        deviceSize: 0,
        iCnt: 0
    };
    //devices = ?
    //Authenticate User
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }

    let userEmail = decodedToken.email;

    //query list of devices by users email. should return a list
    let deviceQuery = Device.find({
        "userEmail": 
        {
            $eq: userEmail
        },

    }).sort({ "lastContact": -1 });

    //query callback function when Device.find is done.
    deviceQuery.exec({}, function(err, userDevices) {
    //create query search here since multiple devices could be found.    
        query =  {
            $or : []
          } ;

        console.log("device query");

        responseJson.deviceSize = userDevices.length;
        //res.write(JSON.stringify(responseJson));

        //create query object based on how many device Id's the user has.
        //need all to find all activities. This number is not known since the user can have a lot of 
        //devices.
        for (let device of userDevices) {

           // { created : { $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000))) } }
            query.$or.push({
                $and : [
                    {"deviceId": device.deviceId},
                    {"created" : { $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000))) }}
                ]
            });
            }
        
        //console.log(query);    
        let numActivities = 0;

        let activityQuery = Activity.find(query);
        
        //callback function for activityQuery find.
        activityQuery.exec({}, function(err, userActivities) {

            let numActivities = 0;

            if (err) {
                responseJson.message = "returned null";
                return res.status(400).json(responseJson);
            }
            for (let activities of userActivities) {
                responseJson.totalCals += activities.calsBurned;
                responseJson.totalUV += activities.avgUV;
                responseJson.totalDuration += activities.duration;
    
                responseJson.activities.push(
                    {
                     deviceId:       activities.deviceId,
                     averageSpeed:   activities.avgSpeed,
                     averageUV:      activities.avgUV,
                     activityType:   activities.type,
                     date:           activities.created,
                     duration:       activities.duration,
                     calsBurned:      activities.calsBurned,
                     temp:          activities.temperture,
                     humid:         activities.humidity
                    
                }
                    
                );
                numActivities++;

                //console.log(activities);
            }

            responseJson.message = "Summary Activity Data Returned Sucessfully";
            return res.status(200).send(JSON.stringify(responseJson));
        });


    });

});


// GET: Returns all measurements first reported in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/summary", function(req, res) {
    let days = 7;
    //days = parseInt(days);
    //let iCnt = 0;
    let responseJson = {
        success: true,
        message: "",
        activities: [],
        numActivities: 0,
        totalCals: 0,
        totalUV: 0,
        totalDuration: 0,
        deviceSize: 0,
        iCnt: 0
    };
    //devices = ?
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
        responseJson.
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(200).json(responseJson);
    }
    
    let userEmail = decodedToken.email;

    let numActivities = 0;
    // Find all devices for user
    let deviceQuery = Device.find({
        "userEmail": 
        {
            $eq: userEmail
        },

    }).sort({ "lastContact": -1 });

    deviceQuery.exec({}, function(err, userDevices) {
        console.log("device query");
        responseJson.deviceSize = userDevices.length;
        //return userDevices;

        
        //let iCnt = 0;
        for (let i of userDevices) {
            //console.log("i");
            //responseJson.iCnt += 1;

            Activity.find({

                $and: [ { deviceId : i.deviceId }, { created : { $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000))) } } ]},

                function(err, activities) {
                    //responseJson.iCnt += 1;
                    if (err) { //checks error
                        console.log("error");
                        responseJson.success = false;
                        responseJson.message = "Error accessing activity db.";
                        return res.status(401).send(JSON.stringify(responseJson));
                    }

                    else if (activities.length > 0) { //find function found an activity with device.
                        //Create list of activity data     
                        
                 //let numActivities = 0;
                     
                 for (let newActivity of activities) { 
         
                     //for (measurements of newActivity.measurement) {
                     //    speedArray.push(measurements.speed);
                         //same uv
                     //}
                     responseJson.totalCals += newActivity.calsBurned;
                     responseJson.totalUV += newActivity.avgUV;
                     responseJson.totalDuration += newActivity.duration;
         
                     responseJson.activities.push(
                         {
                          deviceId:       newActivity.deviceId,
                          averageSpeed:   newActivity.avgSpeed,
                          averageUV:      newActivity.avgUV,
                          activityType:   newActivity.type,
                          date:           newActivity.created,
                          duration:       newActivity.duration,
                          calsBurned:      newActivity.calsBurned,
                          temp:          newActivity.temperture,
                          humid:         newActivity.humidity
             
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

                 console.log("@");
                    

                    }

                    else {
                       //responseJson.iCnt += 1;
                    }
                    console.log("#");
                    responseJson.iCnt+=1;

                    if (responseJson.iCnt == responseJson.deviceSize) {
                        responseJson.message = "In the past " + days + " days, you've done " + responseJson.activities.length + " activities!";
                        return res.status(200).send(JSON.stringify(responseJson));   
                     }
                });
                console.log("*");
            }
            console.log("^");
    });
    console.log("()");
    //res.status(200).send(JSON.stringify(responseJson));
});




router.get("/all", function(req, res) {
    let days = 60;
    //days = parseInt(days);
    //let iCnt = 0;
    let responseJson = {
        success: true,
        message: "",
        activities: [],
        numActivities: 0,
        totalCals: 0,
        totalUV: 0,
        totalDuration: 0,
        deviceSize: 0,
        iCnt: 0
    };
    //devices = ?
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
    if (days < 1 || days > 365) {
        responseJson.
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(200).json(responseJson);
    }
    
    let userEmail = decodedToken.email;

    let numActivities = 0;
    // Find all devices for user
    let deviceQuery = Device.find({
        "userEmail": 
        {
            $eq: userEmail
        },

    }).sort({ "lastContact": -1 });

    deviceQuery.exec({}, function(err, userDevices) {
        console.log("device query");
        responseJson.deviceSize = userDevices.length;
        //return userDevices;

        
        //let iCnt = 0;
        for (let i of userDevices) {
            //console.log("i");
            //responseJson.iCnt += 1;

            Activity.find({

                $and: [ { deviceId : i.deviceId }, { created : { $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000))) } } ]},

                function(err, activities) {
                    //responseJson.iCnt += 1;
                    if (err) { //checks error
                        console.log("error");
                        responseJson.success = false;
                        responseJson.message = "Error accessing activity db.";
                        return res.status(401).send(JSON.stringify(responseJson));
                    }

                    else if (activities.length > 0) { //find function found an activity with device.
                        //Create list of activity data     
                        
                 //let numActivities = 0;
                     
                 for (let newActivity of activities) { 
         
                     //for (measurements of newActivity.measurement) {
                     //    speedArray.push(measurements.speed);
                         //same uv
                     //}
                     responseJson.totalCals += newActivity.calsBurned;
                     responseJson.totalUV += newActivity.avgUV;
                     responseJson.totalDuration += newActivity.duration;
         
                     responseJson.activities.push(
                         {
                          deviceId:       newActivity.deviceId,
                          averageSpeed:   newActivity.avgSpeed,
                          averageUV:      newActivity.avgUV,
                          activityType:   newActivity.type,
                          date:           newActivity.created,
                          duration:       newActivity.duration,
                          calsBurned:      newActivity.calsBurned,
                          temp:          newActivity.temperture,
                          humid:         newActivity.humidity
             
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

                 console.log("@");
                    

                    }

                    else {
                       //responseJson.iCnt += 1;
                    }
                    console.log("#");
                    responseJson.iCnt+=1;

                    if (responseJson.iCnt == responseJson.deviceSize) {
                        responseJson.message = "In the past " + days + " days, you've done " + responseJson.activities.length + " activities!";
                        return res.status(200).send(JSON.stringify(responseJson));   
                     }
                });
                console.log("*");
            }
            console.log("^");
    });
    console.log("()");
    //res.status(200).send(JSON.stringify(responseJson));
});


router.get("/one", function(req, res) {


    let activityID = req.query.activity;


    let responseJson = {
        success: true,
        message: "",
        activity: {},
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

    // Find all activity with created time in query
    let activityQuery = Activity.findOne({
        "created": 
        {
            $eq: new Date(activityID)
        },

    });    
    
    activityQuery.exec({}, function(err, newActivity) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing activity db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }


        //Create new activity data       
        responseJson.activity = {
            deviceId:       newActivity.deviceId,
            averageSpeed:   newActivity.avgSpeed,
            averageUV:      newActivity.avgUV,
            activityType:   newActivity.type,
            date:           newActivity.created,
            duration:       newActivity.duration,
            calsBurned:      newActivity.calsBurned,
            temp:          newActivity.temperture,
            humid:         newActivity.humidity,
            measurementSize: newActivity.measurement.length,
            measurements:  [],

        }

        //Create list of measurements for activity
        for (let newMeasurement of newActivity.measurement) { 

            responseJson.activity.measurements.push(
                {                    
                
                    loc:            [newMeasurement.longitude, newMeasurement.latitude],
                    uv:             newMeasurement.uv,
                    speed:         newMeasurement.speed,
                    timeReported:  newMeasurement.timeReported,                      
                               
            }
                
            );
            
        }
        responseJson.message = "Detailed Activity Data Returned Sucessfully";
        return res.status(200).send(JSON.stringify(responseJson));
    });

});

//This allows the user to change the activity type 
router.get("/changeActivity", function(req, res) {

    let activityID = req.query.activity;
    let newType = req.query.newType;


    let responseJson = {
        success: true,
        message: "",
        activity: {},
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

    // Find all activity with created time in query
    let activityQuery = Activity.findOne({
        "created": 
        {
            $eq: new Date(activityID)
        },

    });    
    
    activityQuery.exec({}, function(err, activity) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error changing activity type.";
            return res.status(400).send(JSON.stringify(responseJson));
        }

        if (activity.type == req.query.newType) {
            responseJson.message = "Already named that.";
            return res.status(201).send(JSON.stringify(responseJson));

        }
        else {
            activity.type = req.query.newType;
            responseJson.message = "Activity: "+activity.type+ "successfully updated.";
            //return res.status(200).send(JSON.stringify(responseJson));
        }

        activity.save(function(err) {
            if (err) {
            responseJson.success = "ERROR";
            responseJson.message = "Error sav data in db." + err;
            return res.status(201).send(JSON.stringify(responseJson));
        }

        responseJson.success = true;
        return res.status(200).send(JSON.stringify(responseJson));
   });
  
        

    });

});


//This allows the user to change the devices type 
router.get("/replaceDevice", function(req, res) {

    let oldDeviceId = req.query.oldDeviceId;
    let newDeviceId = req.query.newDeviceId;
    //let userEmail = req.query.userEmail;

    let responseJson = {
        success: true,
        message: "",
        devices: {},
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

    // Find all devices with deviceId
    let deviceQuery = Device.findOne({
        "deviceId": 
        {
            $eq: oldDeviceId
        },

    });    
    
    deviceQuery.exec({}, function(err, oldDevice) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error changing device.";
            return res.status(400).send(JSON.stringify(responseJson));
        }
        //Check that new and old device are different
        if (oldDevice.deviceId == req.query.newDeviceId) {
            responseJson.message = "Device already registered.";
            return res.status(201).send(JSON.stringify(responseJson));

        }
        //Erase userEmail from old device
        else {
            oldDevice.deviceId = newDeviceId;
            responseJson.message = "Device: "+oldDevice.deviceId+ "successfully updated.";
            //return res.status(200).send(JSON.stringify(responseJson));
        }

        oldDevice.save(function(err) {
            if (err) {
            responseJson.success = "ERROR";
            responseJson.message = "Error saving data in device db." + err;
            return res.status(201).send(JSON.stringify(responseJson));
        }

        responseJson.success = true;
        return res.status(200).send(JSON.stringify(responseJson));
        });
        
    });

});


//This allows the user to delete a device
/**
 * This only removes the device from the user but never deletes it. Need to delete because a user
 * cannot add a similar device afterwards.
 * 
 * NEEDS WORK!
 */
router.get("/delete", function(req, res) {

    let deviceId = req.query.deviceId;
    
    let responseJson = {
        success: true,
        message: "",
        devices: {},
    };
    
    //Authenticate User
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(4014).json(responseJson);
        }
    }

    // Find all devices with deviceId
    let deviceQuery = Device.findOne({
        "deviceId": 
        {
            $eq: deviceId
        },

    });    
    
    deviceQuery.exec({}, function(err, device) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error changing device.";
            return res.status(400).send(JSON.stringify(responseJson));
        }
        //Erase userEmail from old device
        else {
            device.userEmail = "";
            responseJson.message = "Device: "+device.deviceId+ "successfully updated.";
            //return res.status(200).send(JSON.stringify(responseJson));
        }

        device.save(function(err) {
            if (err) {
            responseJson.success = "ERROR";
            responseJson.message = "Error saving data in device db." + err;
            return res.status(201).send(JSON.stringify(responseJson));
        }

        responseJson.success = true;
        return res.status(200).send(JSON.stringify(responseJson));
        });
        
    });

});





//Get Local User Dat

           
module.exports = router;
