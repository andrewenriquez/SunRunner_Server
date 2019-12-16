//import { get } from "mongoose";

//let map = null;

function getOneData() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/data/one'+window.location.search,
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displayOneData)
    .fail(recentPotholeError);

}

function displayOneData(data, textSatus, jqXHR) {
  //$("#main").show();
  // If there's at least one pothole, draw the map
  let latitude = 32.2319;
  let longitude = -110.9501;
  //window.location="oneActivity.html";
  
  let activityReport = "No activities have been reported this week.";
   if (data.success) {

    //activityReport = data.activities.length +
    " different webhooks detected at different locations.";

    // Start of the list displaying all data points.
    //looping through all potholes and concatenating them to a list.

      let speed = data.activity.averageSpeed.toFixed(1);
      let uv = data.activity.averageUV.toFixed(1);
      let type = data.activity.activityType;
      let firstRep = data.activity.date;
      let duration = data.activity.duration / 60;
      let temp = data.activity.temp;
      let humid = data.activity.humid;
      //let lastRep = data.potholes[i].lastReporte;
      let cal = data.activity.calsBurned.toFixed(1);
      firstRep = new Date(firstRep);
      /*
      */
     let measureSize = data.activity.measurementSize;
     let measurements = data.activity.measurements;
      let todayDate = new Date();

      let speedMeasurements = [];
      let uvMeasurements = [];
      let timePoints = [];

      for (let i of measurements) {
        speedMeasurements.push(i.speed);
        uvMeasurements.push(i.uv);
        timePoints.push(i.timeReported);

      }
      
      //let firstRepDate = new Date(firstRep);
      //let todayWeek = todayDate.getDay();
      //let firstRepWeek = firstRepDate.getDay();
      //line
      var ctx = document.getElementById('myChart').getContext('2d');
      
      var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'line',
      
          // The data for our dataset
          data: {
              labels: timePoints,
              datasets: [{
                  label: 'Measurements',
                  backgroundColor: 'rgb(255, 99, 132)',
                  borderColor: 'rgb(255, 99, 132)',
                  data: speedMeasurements
              }]
          },
      
          // Configuration options go here
          options: {}
      });


}
      //$("#all").append(cardHTML);


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
//close list before displaying.

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
function initOne() {

  getOneData();
  //window.location.replace("oneActivity.html");

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
    //console.log(id);
    
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    initOne();
  }
  // Register event listeners here instead of in init?
});
