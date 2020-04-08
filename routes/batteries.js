let express = require('express');
let router = express.Router();
let Battery = require("../models/battery");
let fs = require('fs');
let jwt = require("jwt-simple");

var secret = "superSecret";

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
  let deviceId = req.params.devid;
  let responseJson = { devices: [] };

  if (deviceId == "all") {
    let query = {};
  }
  else {
    let query = {
      "deviceId" : deviceId
    };
  }
  
  Device.find(query, function(err, allDevices) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let doc of allDevices) {
        responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
      }
    }
    res.status(200).json(responseJson);
  });
});

router.get('/bmsdata', function (req, res) {
    let days = 100;
    
    let responseJson = {
        success : false,
        message : "",
        dataSize: 0,
        dataEntries : [],
    };



        let batteryQuery = Battery.findOne({}).sort( {"date": -1 } );
        
        //callback function for activityQuery find.
        batteryQuery.exec({}, function(err, batteryData) {

            // if (batteryData == null) {
            //   responseJson.message = "no info yet.";
            //   return res.status(300).send(JSON.stringify(responseJson));

            // }

            let numActivities = 0;

            if (err) {
                responseJson.message = "returned null";
                return res.status(400).json(responseJson);
                
            }

    
                responseJson.dataEntries.push(
                    {
                     C1:       batteryData.cell1,
                     C2:   batteryData.cell2,
                     C3:      batteryData.cell3,
                     C4:   batteryData.cell4,
                     C5:           batteryData.cell5,
                     C6:       batteryData.cell6,
                     C7:       batteryData.cell7,
                     C8:   batteryData.cell8,
                     C9:            batteryData.cell9,
                     C10:           batteryData.cell10,
                     C11:            batteryData.cell1,
                     C12:            batteryData.cell12,
                     voltage:        batteryData.voltage,
                     temp:           batteryData.temp,
                     charge:         batteryData.charge,
                     current:        batteryData.current,
                     date:           batteryData.date
                    
                }
                    
                );
                numActivities++;

                //console.log(activities);


            responseJson.message = "Summary Activity Data Returned Sucessfully";
            return res.status(200).send(JSON.stringify(responseJson));
        });

});

router.post('/data', function(req, res, next) {
    let responseJson = {
        success : false,
        message : "",
    };

    // Ensure the POST data include required properties                                               
    if( !req.body.hasOwnProperty("Time") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    // if( !req.body.hasOwnProperty("apikey") ) {
    //     responseJson.message = "Request missing apikey parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }
    
    // if( !req.body.hasOwnProperty("lon") ) {
    //     responseJson.message = "Request missing longitude parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }
    
    // if( !req.body.hasOwnProperty("lat") ) {
    //     responseJson.message = "Request missing latitude parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }

    // if( !req.body.hasOwnProperty("speed") ) {
    //     responseJson.message = "Request missing speed parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }

    // if( !req.body.hasOwnProperty("time") ) {
    //     responseJson.message = "Request missing time parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }

    // if( !req.body.hasOwnProperty("uv") ) {
    //     responseJson.message = "Request missing uv parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }
    
    // if( !req.body.hasOwnProperty("index") ) {
    //     responseJson.message = "Request missing index parameter.";
    //     return res.status(201).send(JSON.stringify(responseJson));
    // }
    
    // Find the device in DB and VERIFY the apikey                                           
            
            //look for the most recent activity based off of time.
                //if the post req has an index value of 0, then we should consider this a new activity and record the start time
                //saving it to the "created" field in the new activity mongo document.

                let batteryQuery = Battery.find({});
                
                
        batteryQuery.exec({}, function(err, battery) {
                if (err) {
                    responseJson.success = false;
                    responseJson.message = "Error adding battery";
                    return res.status(400).send(JSON.stringify(responseJson));
                }
                else{

                    var battery = new Battery({                
                        //type:          String,
                        //temperture:  Number,
                        //humidity:    Number,
                        

                        cell1:          req.body.C1,
                        cell2:          req.body.C2,
                        cell3:          req.body.C3,
                        cell4:          req.body.C4,
                        cell5:          req.body.C5,
                        cell6:          req.body.C6,
                        cell7:          req.body.C7,
                        cell8:          req.body.C8,
                        cell9:          req.body.C9,
                        cell10:         req.body.C10,
                        cell11:         req.body.C11,
                        cell12:         req.body.C12,
                        voltage:        req.body.Voltage,
                        current:        req.body.Current,
                        charge:         req.body.Charge,
                        date:           req.body.Time,
                        temp:           req.body.Temperature, 
                    });
                }
                battery.save(function(err) {
                  if (err) {
                  responseJson.success = "ERROR";
                  responseJson.message = "Error saving battery info in battery db." + err;
                  return res.status(201).send(JSON.stringify(responseJson));
              }
            
              responseJson.success = true;
              return res.status(200).send(JSON.stringify(responseJson));
              });
            
                      
              responseJson.success = true;
              //return res.status(200).json(responseJson);
            });

                 
});


//Delete Device from database
router.post('/delete', function(req, res, next) {
  let responseJson = {
      success: false,
      message : "",
  };
  let deviceExists = false;
  let deviceId = req.body.deviceId;
  console.log(req.body.deviceId);
  // Ensure the request includes the deviceId parameter
  // Ensure the request includes the deviceId parameter
  if( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  else {

    console.log("works");
  }
  
  // If authToken provided, use email in authToken 
  try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
  }
  catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
  }
  
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
    else{

      let userEmail = device.userEmail;
      device.userEmail = "";
      responseJson.message = "Device ID " + req.body.deviceId + " removed from "+userEmail;
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

          
  responseJson.success = true;
  //return res.status(200).json(responseJson);
});
});


module.exports = router;
