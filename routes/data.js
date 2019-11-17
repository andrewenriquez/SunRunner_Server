let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let Device = require("../models/device");
let Measurement = require("../models/measurement");
let User = require("../models/users");

// Secret key for JWT
let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
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

// POST: Adds reported measurment to the database
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
    
    if( !req.body.hasOwnProperty("time") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    // Find the device in DB and verify the apikey                                           
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
            return res.status(201).send(JSON.stringify(responseJson));
        }
        
        if (device.apikey != req.body.apikey) {
            responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
            return res.status(201).send(JSON.stringify(responseJson));
        }
               
             //Create a new measurment and save the measurment to the database
                 var measurment = new Measurment({
                     loc: [req.body.longitude, req.body.latitude],
                     speed: req.body.speed,
                     uv: req.body.uv,
                     dateReported: Date.now(),
                 });
                 responseJson.message = "New measurment recorded.";
                            

             // Save the measurment data. 
             measurment.save(function(err, newMeasurment) {
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

// GET: Returns all measurments first reported in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/recent/:days", function(req, res) {
    let days = req.params.days;
    
    let responseJson = {
        success: true,
        message: "",
        measurments: [],
    };
    
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
    
    // Find all measurments reported in the spcified number of days
    let measurmentQuery = Measurment.find({
        "firstReported": 
        {
            $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)))
        }
    }).sort({ "date": -1 });
    
    
    measurmentQuery.exec({}, function(err, recentMeasurments) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
        else {  
            let numMeasurments = 0;    
            for (let newMeasurment of recentMeasurments) {
                // Add measurment data to the respone's measurments array
                numMeasurments++; 
                responseJson.measurments.push({
                    latitude: newMeasurment.loc[1],
                    longitude: newMeasurment.loc[0],
                    speed: newMeasurment.speed,
                    uvIndex: newMeasurment.uv,
                    date: newMeasurment.dateReported,                 
                });
            }
            responseJson.message = "In the past " + days + " days, " + numMeasurments + " measurments have been taken.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
    })
});


module.exports = router;