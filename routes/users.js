let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
let request = require("request");

/* Authenticate user */
//var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
//var secret = "superSecret";


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


router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
       res.status(401).json({success : false, message : "Can't connect to DB."});         
    }
    else if(!user) {
       res.status(401).json({success : false, message : "Email or password invalid."});         
    }
    else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
         if (err) {
           res.status(401).json({success : false, message : "Error authenticating. Contact support."});         
         }
         else if(valid) {
            var authToken = jwt.encode({email: req.body.email}, secret);
            res.status(201).json({success:true, authToken: authToken});
         }
         else {
            res.status(401).json({success : false, message : "Email or password invalid."});         
         }
         
      });
    }
  });
});

/* Register a new user */
router.post('/register', function(req, res, next) {
   
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
         res.status(400).json({success : false, message : err.errmsg});         
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash
        });
        
        newUser.save(function(err, user) {
          if (err) {
             res.status(400).json({success : false, message : err.errmsg});         
          }
          else {
             res.status(201).json({success : true, message : user.fullName + "has been created"});                      
          }
        });
      }
   });   
});

router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(400).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
            
            // Find devices based on decoded token
		      Device.find({ userEmail : decodedToken.email}, function(err, devices) {
			      if (!err) {
			         // Construct device list
			         let deviceList = []; 
			         for (device of devices) {
				         deviceList.push({ 
				               deviceId: device.deviceId,
				               apikey: device.apikey,
				         });
			         }
			         userStatus['devices'] = deviceList;
			      }
			      
               return res.status(200).json(userStatus);            
		      });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

/*
router.get("/weather", function(req, res,) {


   let responseJson = {
       success: true,
       message: "",
       forecast: [],
   };

   let lon = "-110.950111";
   let lat = "32.231884";
   
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
   var APIKEY2 = "4913031574b69f29c41a404c564859ee";

   let myData = {
      

      url: "https://api.darksky.net/forecast/"+APIKEY2+"/"+lat+","+lon,
      method: 'GET'
  };

  request(myData, function(err, resp, body) {
      
   
      if (err) {
          //console.log("error");
          responseJson.message = "Error accessing weather api";
          return resp.status(400).send(JSON.stringify(responseJson));
      }

      else if (body) {

          let apiData = JSON.parse(body);

          if (apiData.code == 400) {

            responseJson.message = api.status;
            return resp.status(apiData.code).send(JSON.stringify(responseJson));
              //return res.status(400).send(JSON.stringify(responseJson));
          }
          
          else {
            for (let days of apiData.daily.data) {
               
               responseJson.forecast.push({
                  day            : new Date(days.time * 1000).getDay(),
                  temperatureMax : days.temperatureMax,
                  temperatureMin : days.temperatureMin,
                  humidity       : days.humidity * 100,
                  summary        : days.summary
               });

            }  

            responseJson.message = "Success requesting forecast";
            //return responseJson;

          }


         }
//return res.status(200).send(JSON.stringify(responseJson));
      });

});*/


module.exports = router;