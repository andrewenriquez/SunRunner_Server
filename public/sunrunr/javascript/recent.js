//import { get } from "mongoose";

let map = null;

let id = "123";

function getRecentData() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/data/summary2',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
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


  for (let i = 0; i < 6; i++ ){

    $("#day"+i+"_title").html(weekdays[forecastObj.forecast[i].day]);
      $("#day"+i+"_body").html("<p class=\"card-text\">"+forecastObj.forecast[i].summary+"</p>"+
      "<ul> <li>High: "+forecastObj.forecast[i].temperatureMax+String.fromCharCode(176)+"F</li>"+
      "<li> Low: "+forecastObj.forecast[i].temperatureMin+String.fromCharCode(176)+"F</li>"+
      "<li> Himidity: "+forecastObj.forecast[i].humidity.toFixed(0)+"%</li>"+
      "</ul>");
    

  }
    
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

    $("#total_uv").html(data.totalUV.toFixed(1)+" mW/cm2");
    $("#total_min").html((data.totalDuration / 60 )+" mins");
    $("#total_cals").html(data.totalCals.toFixed(1)+" Cals");
    //looping through all potholes and concatenating them to a list.
     for (var i = data.activities.length - 1; i >= 0; i--) {

      let speed = data.activities[i].averageSpeed.toFixed(1);
      let uv = data.activities[i].averageUV.toFixed(1);
      let type = data.activities[i].activityType;
      let firstRep = data.activities[i].date;
      //firstRep = new Date(firstRep);
      let duration = data.activities[i].duration / 60;
      //let lastRep = data.potholes[i].lastReporte;
      let cal = data.activities[i].calsBurned.toFixed(1);
      let temp = data.activities[i].temp;
      temp = temp.toFixed(1)+String.fromCharCode(176);
      let humid = data.activities[i].humid * 100;
      let deviceId = data.activities[i].deviceId;
      
      let cardHTML = "<div class=\"col-sm-10 col-md-3 col-lg-4\"><div class=\"mt-4\"><div class=\"card\"><div class=\"card-body\">"
      cardHTML += "<h5 class=\"card-title\" id=\"type\">"+type+"</h5><h6 class=\"card-subtitle mb-2 text-muted\">Device ID: ";
      cardHTML += deviceId+" </h6><p class=\"card-text\">Date: "+new Date(firstRep);
      cardHTML += "</p><table class=\"table\"><tbody><tr><td>Calories:</td><td id=\"calories\">"+cal+"</td></tr><tr><td>Speed:";
      cardHTML += " </td><td id=\"speed\">"+speed+"</td></tr><tr><td>UV:</td><td id=\"uv\">"+uv+"</td></tr>"
      + "<tr><td>Duration: </td><td>"+duration+" mins</td></tr>"
      + "<tr><td>Temp: </td><td>"+temp+" F</td></tr>"
      + "<tr><td>Humidity: </td><td>"+humid.toFixed(0)+" %</td></tr></tbody></table>";
      cardHTML += "<button id = \""+firstRep+"\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\">More Info</button>";
      //cardHTML += 
      cardHTML +="</div></div></div></div>";

      $("button").click(myCallback);
      //$("#"+firstRep).click(myCallback);
      
      let todayDate = new Date();
      let firstRepDate = new Date(firstRep);
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
  getRecentData();


  //if ($("#flag-0").)
  //getForecastData(); //gets forecast for next 6 days


}

function myCallback() {
  //console.log(this);
  id = this.id;

  //window.location.search = this.id;

  if (this.id == "refreshWeather") {
    getForecastData();
  }
  else {
    window.location.replace("oneActivity.html?activity="+this.id);
  }

  //location.reload();

  
  //getOneData();
}

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
  $("button #refreshWeather").click(getForecastData);

  // Register event listeners here instead of in init?
});
