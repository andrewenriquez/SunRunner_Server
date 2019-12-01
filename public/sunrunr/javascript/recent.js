//import { get } from "mongoose";

let map = null;

function getRecentPotholes() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/data/recent/30',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displayMostRecentPothole)
    .fail(recentPotholeError);

}

function displayMostRecentPothole(data, textSatus, jqXHR) {
  $("#main").show();
  // If there's at least one pothole, draw the map
  let latitude = 32.2319;
	let longitude = -110.9501;
  let potholeReport = "No potholes have been reported in the last three days.";
   if (data.potholes.length > 0) {

    potholeReport = data.potholes.length +
    " different webhooks detected at different locations.";

    // Start of the list displaying all data points.
    potholeReport += "<ul><li>Most recent:</li>";

    //looping through all potholes and concatenating them to a list.
     for (var i = data.potholes.length - 1; i >= 0; i--) {
      let latitude = data.potholes[i].latitude;
      let longitude = data.potholes[i].longitude;
      let uvRay = data.potholes[i].uv;
      let hits = data.potholes[i].totalHits;
      let firstRep = data.potholes[i].firstReported;
      let lastRep = data.potholes[i].lastReported;
      let gpsSpeed = data.potholes[i].gpsSpeed;


      potholeReport += "<li>Total Hits: "
      +hits+", latitude: "+latitude+", longitude: "+longitude+", Speed: "+gpsSpeed+", UV Strength: "+uvRay+
      ", First Reported: "+firstRep+", last Reported: "+lastRep+"</li>"

     }
     potholeReport+= "</ul>" //close list before displaying.

  }
  /*
  //What does this do??
  let uluru = {lat: latitude, lng: longitude};
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: uluru
 });  

  //What does this do??
  $("#potholeText").html(potholeReport);
  
 // Add markers for all potholes            
  for (let pothole of data.potholes) {
    uluru = {lat: pothole.latitude, lng: pothole.longitude};
    let marker = new google.maps.Marker({
        position: uluru,
        map: map,
        label: {
             text: "" + pothole.totalHits,
             color: 'black',
             fontSize: "10px"
        },
    });
  }    
  */
}

function recentPotholeError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
     console.log("error 401");
   //window.localStorage.removeItem("authToken");
   //window.location.replace("index.html");
 } 
 else {
   $("#potholeText").html("Error: " + status.message);
   $("#potholeText").show();
 } 
}

// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
function initRecent() {
    // Allow the user to refresh by clicking a button.
    $("#refreshRecent").click(getRecentPotholes);
    $("#testButton").click(getRecentPotholes);
    //getRecentPotholes();
}


/*
function test () {
  $("button").html("unclick");

}

 //Need to fix before authenicating.
// Handle authentication on page load

$(document).ready(function() {
  getRecentPotholes();
   $("button").click(getRecentPotholes);
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   //if (!window.localStorage.getItem("authToken")) {
   //   window.location.replace("index.html");
   //}
});
*/

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    initRecent();
  }
  // Register event listeners here instead of in init?
});
