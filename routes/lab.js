var express = require('express');
var router = express.Router();
var Device = require("../models/device"); //for the db to work. 

//get router for lab to check the status of each zip code. Will also send back error
//meassages depending on the query.
router.get('/status', function(req, res, next) {
    var deviceId = req.query.zip;
    var errMessage = {"error" : "a zip code is require."};
    var errMessage2 = {"error" : "Zip does not exist in the database."};
    var zipSize = 5;
    
    var totalSum = 0;
    var arrayLength = 0;
    
    
    if(!(deviceId.length == zipSize))
    {
	res.status(400).json(errMessage);
	return;
    }

    var query = {
        "zip" : deviceId
    };

    Device.find(query, function(err, recordings) {
	if(recordings.length == 0)
	{
	   res.status(400).json(errMessage2);
	   return;
	}
	//Walks through array and adds it to the total air quality
    //Takes note of the length of the array
    
    //loops through array and sums all elements in the array to take an average
    //of those values.
	for(let i=0; i < recordings.length; i++)
	{
	   totalSum += recordings[i].airQuality;
	   arrayLength++;
    }
    
	var averageAirQuality = (totalSum / arrayLength).toFixed(2);

	res.status(200).json(averageAirQuality);
	return;
    });
});

//this router handles the /lab/register post for the zip and air quality parameters.
router.post('/register', function(req, res, next) {
    var errMessage = {"error" : "zip and airQuality are required."};
    var Msg = {"response" : "Data recorded."};
    var deviceExists = false;

    if(!req.body.hasOwnProperty("zip")) {
	res.status(400).json(errMessage);
        return;
    }
    
    if(isNaN(req.body.zip)){
	res.status(400).json(errMessage);
	return;
    }

    if( !req.body.hasOwnProperty("airQuality")) {
        res.status(400).json(errMessage);
	return;
    }

    var newDevice = new Device({
	zip:req.body.zip,
	airQuality:req.body.airQuality
    });

    newDevice.save(function(error, newDevice){
	return res.status(201).json(Msg);
   });
});

module.exports = router;
