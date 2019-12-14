//import { get } from "mongoose";

let map = null;

function getRecentData() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/data/summary',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displayMostRecentData)
    .fail(recentPotholeError);

}

function displayMostRecentData(data, textSatus, jqXHR) {
  //$("#main").show();
  // If there's at least one pothole, draw the map
  let latitude = 32.2319;
  let longitude = -110.9501;

  
  let activityReport = "No activities have been reported this week.";
   if (data.activities.length > 0) {

    activityReport = data.activities.length +
    " different webhooks detected at different locations.";

    // Start of the list displaying all data points.
    activityReport += "<ul><li>Most recent:</li>";

    //looping through all potholes and concatenating them to a list.
     for (var i = data.activities.length - 1; i >= 0; i--) {

      let speed = data.activities[i].averageSpeed;
      let uv = data.activities[i].averageUV;
      let type = data.activities[i].activityType;
      let firstRep = data.activities[i].date;
      let duration = data.activities[i].duration / 60;
      //let lastRep = data.potholes[i].lastReporte;
      let cal = 333;
      
      let cardHTML = "<div class=\"card\"><div class=\"card-body\">"
      cardHTML += "<h5 class=\"card-title\" id=\"type\">"+type+"</h5><h6 class=\"card-subtitle mb-2 text-muted\" id=\"duration\">";
      cardHTML += duration+" min</h6><p class=\"card-text\">Some quick example text.";
      cardHTML += "</p><table class=\"table\"><tbody><tr><td>Calories:</td><td id=\"calories\">"+cal+"</td></tr><tr><td>Speed:";
      cardHTML += " </td><td id=\"speed\">"+speed+"</td></tr><tr><td>UV:</td><td id=\"uv\">"+uv+"</td></tr></tbody></table><a href=\"#\"";
      cardHTML += "class=\"card-link\">More Info</a></div></div>";
      
      let todayDate = new Date();
      let firstRepDate = new Date(firstRep);
      let todayWeek = todayDate.getDay();
      let firstRepWeek = firstRepDate.getDay();
      
  switch(todayWeek ) {
    case 0:                      //sunday
      //change page


      break;

    case 1:
      //change page

      break;

    case 2:
     
      break;

    case 3:
   
      break;

    case 4:


      break;
      
    case 5:
 
      break;

    case 6:

      break;
  }

      $("#todayCards").append(cardHTML);


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
     activityReport+= "</ul>" //close list before displaying.

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
  
  let todayDate = new Date();
  let todayWeek = todayDate.getDay();

  switch(todayWeek) {
    case 0:                      //sunday
      //change page
      $("#today").html("SUNDAY (Today)");
      $("#yesterday").html("SATURDAY (Yesterday)");
      $("#twoDaysAgo").html("FRIDAY");
      $("#threeDaysAgo").html("THURSDAY");
      $("#fourDaysAgo").html("WEDNESDAY");
      $("#fiveDaysAgo").html("TUESDAY");
      $("#sixDaysAgo").html("MONDAY");
      break;

    case 1:
      //change page
      $("#today").html("MONDAY (Today)");
      $("#yesterday").html("FRIDAY (Yesterday)");
      $("#twoDaysAgo").html("THURSDAY");
      $("#threeDaysAgo").html("WEDNESDAY");
      $("#fourDaysAgo").html("TUESDAY");
      $("#fiveDaysAgo").html("MONDAY");
      $("#sixDaysAgo").html("SUNDAY");

      break;

    case 2:
      $("#today").html("TUESDAY (Today)");
      $("#yesterday").html("MONDAY (Yesterday)");
      $("#twoDaysAgo").html("SUNDAY");
      $("#threeDaysAgo").html("SATURDAY");
      $("#fourDaysAgo").html("FRIDAY");
      $("#fiveDaysAgo").html("THURSDAY");
      $("#sixDaysAgo").html("WEDNESDAY");      
      break;

    case 3:
      $("#today").html("WEDNESDAY (Today)");
      $("#yesterday").html("TUESDAY (Yesterday)");
      $("#twoDaysAgo").html("MONDAY");
      $("#threeDaysAgo").html("SUNDAY");
      $("#fourDaysAgo").html("SATURDAY");
      $("#fiveDaysAgo").html("FRIDAY");
      $("#sixDaysAgo").html("THURSDAY");     
      break;

    case 4:
      $("#today").html("THURSDAY (Today)");
      $("#yesterday").html("WEDNESDAY (Yesterday)");
      $("#twoDaysAgo").html("TUESDAY");
      $("#threeDaysAgo").html("MONDAY");
      $("#fourDaysAgo").html("SUNDAY");
      $("#fiveDaysAgo").html("SATURDAY");
      $("#sixDaysAgo").html("FRIDAY");

      break;
      
    case 5:
      $("#today").html("FRIDAY (Today)");
      $("#yesterday").html("THURSDAY (Yesterday)");
      $("#twoDaysAgo").html("WEDNESDAY");
      $("#threeDaysAgo").html("TUESDAY");
      $("#fourDaysAgo").html("MONDAY");
      $("#fiveDaysAgo").html("SUNDAY");
      $("#sixDaysAgo").html("SATURDAY");    
      break;

    case 6:
      $("#today").html("SATURDAY (Today)");
      $("#yesterday").html("FRIDAY (Yesterday)");
      $("#twoDaysAgo").html("THURSDAY");
      $("#threeDaysAgo").html("WEDNESDAY");
      $("#fourDaysAgo").html("TUESDAY");
      $("#fiveDaysAgo").html("MONDAY");
      $("#sixDaysAgo").html("SUNDAY");
      break;
  }

  getRecentData();

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
