//import { get } from "mongoose";

let map = null;

let id = "123";

function getRecentData() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/batteries/bmsdata',
    type: 'GET',
    //headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json',
    contentType: 'application/json',
  })
    .done(displayMostRecentData)
    .fail(recentPotholeError);

}

function getForecastData() {
  //console.log("recent button pressed");
  //var APIKEY = "527303e31c944895fd262ec2c68a5c1d";
  var APIKEY2 = "4913031574b69f29c41a404c564859ee";
  let lon = "-110.950111";
  let lat = "32.231884";
  let proxy = "https://cors-anywhere.herokuapp.com/";

 $.ajax({
   url: proxy+"https://api.darksky.net/forecast/"+APIKEY2+"/"+lat+","+lon,
   method: 'GET',
   //data: re,
   //headers: { 'x-auth': window.localStorage.getItem("authToken") },
   headers: { "Access-Control-Allow-Origin": "*" },
   dataType: 'json'
 })
   .done(displayForecastData)

   .fail(recentPotholeError);
}
//makes call for forecast
function displayForecastData(data, textSatus,jqXHR) {
  var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  let forecastObj = {
    success: true,
    message: "",
    forecast: [],

    
};

  if (data) {
    //console.log(data.message);

    for (let days of data.daily.data) {
      
               
      forecastObj.forecast.push({
         day            : new Date(days.time * 1000).getDay(),
         temperatureMax : days.temperatureMax,
         temperatureMin : days.temperatureMin,
         humidity       : days.humidity * 100,
         summary        : days.summary
      });

   }  

  }


  for (let i = 1; i < 13; i++ ){

    $("#day"+i+"_title").html("Cell "+ i);
      $("#day"+i+"_body").html("<ul class='list-group'><li class='list-group-item'>Voltage: </li>"+
      "<li class='list-group-item'>Charge: </li>"+
      "<li class='list-group-item'>Temperature: </li>"+
    "</ul>");    

  }
    
}

function displayMostRecentData(data, textSatus, jqXHR) {

  
  let activityReport = "No activities have been reported this week.";
   if (data.dataEntries.length > 0) {
    let todayDate = new Date();

    //looping through all potholes and concatenating them to a list.
     for (var i = 1; i <= 12; i++) {

      let voltage = data.dataEntries[0]["C"+i];
      let charge = data.dataEntries[0].charge;
      let temp = data.dataEntries[0].temp;
      let firstRep = new Date(data.dataEntries[0].date);
      let updated = todayDate.getMinutes() - firstRep.getMinutes;
      

      //data.activities[i].averageSpeed.toFixed(1);
      //let uv = data.activities[i].averageUV.toFixed(1);
      //let type = "Cell #"
      //let firstRep = data.activities[i].date;
      //firstRep = new Date(firstRep);
      //let duration = data.activities[i].duration / 60;
      //let lastRep = data.potholes[i].lastReporte;
      //let cal = data.activities[i].calsBurned.toFixed(1);
      //let temp = data.activities[i].temp;
      //temp = temp.toFixed(1)+String.fromCharCode(176);
      //let humid = data.activities[i].humid * 100;
      //let deviceId = data.activities[i].deviceId;
      
      let cardHTML = "<div class=\"col-sm-10 col-md-4 col-lg-3\"><div class=\"mt-2\"><div class=\"card\"><div class=\"card-body\">"
      cardHTML += "<h5 class=\"card-title\" id=\"type\"></h5><h6 class=\"card-subtitle mb-2 text-muted\">Cell: "+i;
      cardHTML += " </h6><p class=\"card-text\">updated: "+firstRep;
      cardHTML += "</p><table class=\"table\"><tbody><tr><td>Voltage:</td><td id=\"voltage\">"+voltage+"</td></tr><tr><td>Charge:";
      cardHTML += " </td><td id=\"charge\">"+charge+"</td></tr><tr><td>Temp:</td><td id=\"temp\">"+temp+"</td></tr>"
      + "</tbody></table>";
      cardHTML += "<button id = \""+firstRep+"\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\">More Info</button>";
      //cardHTML += 
      cardHTML +="</div></div></div></div>";

      //$("button").click(myCallback);
      //$("#"+firstRep).click(myCallback);
      
    
      let firstRepDate = new Date();
      let todayWeek = todayDate.getDay();
      let firstRepWeek = firstRepDate.getDay();

      if (todayWeek == 0) { todayWeek = 7; }
      if (firstRepWeek == 0) { firstRepWeek = 7; } //change to 7 for sundays.

      $("#sum").append(cardHTML);


     
    
    }
    $("button").click(myCallback);

    // $("#"+firstRep).click(myCallback);
    // activityReport+= "</ul>" //close list before displaying.
    }
 //getForecastData();
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
   //$("#potholeText").html("Error: " + status.message);
   //$("#potholeText").show();

   for (let i = 0; i < 6; i++ ){

    $("#day"+i+"_title").html("Error Loading Weather Forecast.");

   
 } 
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
      $("#yesterday").html("SUNDAY (Yesterday)");
      $("#twoDaysAgo").html("SATURDAY");
      $("#threeDaysAgo").html("FRIDAY");
      $("#fourDaysAgo").html("THURSDAY");
      $("#fiveDaysAgo").html("WEDNESDAY");
      $("#sixDaysAgo").html("TUESDAY");

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
  //getRecentData();


  //if ($("#flag-0").)
  //getForecastData(); //gets forecast for next 6 days


}


// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  getRecentData();
  $("button #refreshWeather").click(getForecastData);

  // Register event listeners here instead of in init?
});
