//import { get } from "mongoose";

let map = null;

function getRecentPotholes() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/potholes/recent/14',
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
	   let latitude = data.potholes[data.potholes.length-1].latitude;
     let longitude = data.potholes[data.potholes.length-1].longitude;
   }
     /*let potholeReport = "";
   potholeReport += "<table>";
    if (data.potholes.length > 0) {
      let latitude = data.potholes[data.potholes.length-1].latitude;
      let longitude = data.potholes[data.potholes.length-1].longitude;
      let i =0;
        for(i =0; i < data.potholes.length; i++){
          potholeReport += "<tr><td>" + data.potholes[i].latitude + "</td></tr>";
        }
    }
      potholeReport += "</table>";*/


     //let uv = data.potholes[data.potholes.length-1].uv;
      // Add descriptive text of the pothole recently reported 
      potholeReport ="Number of webhooks detected " + data.potholes[data.potholes.length-1].totalHits + " times.";
      //potholeReport = "{latitude:"+latitude +"   longitude:"+ longitude+"}";
   
	    
   $("#potholeText").html(potholeReport);

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
    getRecentPotholes();
}

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
