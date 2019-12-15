//import { get } from "mongoose";

let map = null;

function getAllData() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/data/all',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displayAllData)
    .fail(recentPotholeError);

}

function displayAllData(data, textSatus, jqXHR) {
  //$("#main").show();
  // If there's at least one pothole, draw the map
  let latitude = 32.2319;
  let longitude = -110.9501;

  
  let activityReport = "No activities have been reported this week.";
   if (data.activities.length > 0) {

    activityReport = data.activities.length +
    " different webhooks detected at different locations.";

    // Start of the list displaying all data points.
    //looping through all potholes and concatenating them to a list.
     for (var i = data.activities.length - 1; i >= 0; i--) {

      let speed = data.activities[i].averageSpeed;
      let uv = data.activities[i].averageUV;
      let type = data.activities[i].activityType;
      let firstRep = Date(data.activities[i].date);
      let duration = data.activities[i].duration / 60;
      //let lastRep = data.potholes[i].lastReporte;
      let cal = data.activities[i].calsBurned;
      
      let cardHTML = "<div class=\"card\"><div class=\"card-header text-light bg-info\">"+firstRep+"</div><div class=\"card-body\">"
      cardHTML += "<h5 class=\"card-title\" id=\"type\">"+type+"</h5><h6 class=\"card-subtitle mb-2 text-muted\" id=\"duration\">";
      cardHTML += duration+" min</h6><p class=\"card-text\">Some quick example text.";
      cardHTML += "</p><table class=\"table\"><tbody><tr><td>Calories:</td><td id=\"calories\">"+cal+"</td></tr><tr><td>Speed:";
      cardHTML += " </td><td id=\"speed\">"+speed+"</td></tr><tr><td>UV:</td><td id=\"uv\">"+uv+"</td></tr></tbody></table><a href=\"#\"";
      cardHTML += "class=\"card-link\">More Info</a></div></div>";
      
      let todayDate = new Date();
      //let firstRepDate = new Date(firstRep);
      //let todayWeek = todayDate.getDay();
      //let firstRepWeek = firstRepDate.getDay();
      


      $("#all").append(cardHTML);


      /*
      activityReport += "<li>Activity: "
      +type+", Calories:, Speed: "+speed+", UV Strength: "+uv+
      ", First Reported: "+firstRep+", last Reported: </li>"
      $("#test1").append(cardHTML);
      $("#type").html(type);
      $("#uv").html(uv);
      $("#speed").html(speed);
      $("#calories").html("400");
      $("#duration").text(firstRep);*/
     }
//close list before displaying.

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

  getAllData();

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
