//import { get } from "mongoose";

let map = null;

let id = "123";

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

function getForecastData() {
  //console.log("recent button pressed");
  var APIKEY = "527303e31c944895fd262ec2c68a5c1d";
 $.ajax({
   url: "http://api.openweathermap.org/data/2.5/forecast?zip=85741,us&APPID="+APIKEY,
   type: 'GET',
   //data: requestData,
   //headers: { 'x-auth': window.localStorage.getItem("authToken") },
   dataType: 'json'
 })
   .done(displayForecastData)
   .fail(recentPotholeError);

}

function displayForecastData(data, textSatus,jqXHR) {

    let day1 = {
      date: "",
      tempMax: 0,
      tempMin: 0,
      description: "",
      humidity: 0,
    };
    let day2 = {
      date: "",
      tempMax: 0,
      tempMin: 0,
      description: "",
      humidity: 0,
    };
    let day3 = {
      date: "",
      tempMax: 0,
      tempMin: 0,
      description: "",
      humidity: 0,
    };
    let day4 = {
      date: "",
      tempMax: 0,
      tempMin: 0,
      description: "",
      humidity: 0,
    };
    let day5 = {
      date: "",
      tempMax: 0,
      tempMin: 0,
      description: "",
      humidity: 0,
    };

    date = data.list[39].dt_txt;

    //newDate = new Date(date);
  //console.log(data.list[0].main.temp);
  //console.log(data.list[0].dt);
  //console.log(date);
  //console.log(newDate);
  //console.log(newDate.getDay());
    let todayDate = new Date();
    let todayWeek = todayDate.getDay();
    let todayTime = todayDate.getHours();


    for (let cast of data.list) {
      txtDate = cast.dt_txt;
      formatDate = new Date(txtDate);

      switch (formatDate.getDay() - todayWeek) {
        case 0:
          if (day1.tempMax == 0 || day1.tempMax < cast.main.temp_max) {
            day1.tempMax = cast.main.temp_max;
          }
        if (day1.tempMin == 0 || day1.tempMin > cast.main.temp_min) {
            day1.tempMin = cast.main.temp_min;
          }

        if (day1.humidity == 0 || day1.humidity < cast.main.humidity) {
          day1.humidity = cast.main.humidity;
        }
            day1.description = cast.weather[0].description;
            day1.date = formatDate.getMonth()+1+"/"+formatDate.getDate()+"/"+formatDate.getFullYear();
            //$("#day1").append("</ul>");
          break;

        case 1:
          if (day2.tempMax == 0 || day2.tempMax < cast.main.temp_max) {
            day2.tempMax = cast.main.temp_max;
          }
        if (day2.tempMin == 0 || day2.tempMin > cast.main.temp_min) {
            day2.tempMin = cast.main.temp_min;
          }

        if (day2.humidity == 0 || day2.humidity < cast.main.humidity) {
          day2.humidity = cast.main.humidity;
        }
            day2.description = cast.weather[0].description;
            day2.date = formatDate.getMonth()+1+"/"+formatDate.getDate()+"/"+formatDate.getFullYear();

            break;

        case 2: 
        if (day3.tempMax == 0 || day3.tempMax < cast.main.temp_max) {
          day3.tempMax = cast.main.temp_max;
        }
      if (day3.tempMin == 0 || day3.tempMin > cast.main.temp_min) {
          day3.tempMin = cast.main.temp_min;
        }

      if (day3.humidity == 0 || day3.humidity < cast.main.humidity) {
        day3.humidity = cast.main.humidity;
      }
          day3.description = cast.weather[0].description;
          day3.date = formatDate.getMonth()+1+"/"+formatDate.getDate()+"/"+formatDate.getFullYear();


         break;

        case 3: 
        if (day4.tempMax == 0 || day4.tempMax < cast.main.temp_max) {
          day4.tempMax = cast.main.temp_max;
        }
      if (day4.tempMin == 0 || day4.tempMin > cast.main.temp_min) {
          day4.tempMin = cast.main.temp_min;
        }

      if (day4.humidity == 0 || day4.humidity < cast.main.humidity) {
        day4.humidity = cast.main.humidity;
      }
          day4.description = cast.weather[0].description;
          day4.date = formatDate.getMonth()+1+"/"+formatDate.getDate()+"/"+formatDate.getFullYear();
         break;

        case 4: 
        if (day5.tempMax == 0 || day5.tempMax < cast.main.temp_max) {
          day5.tempMax = cast.main.temp_max;
        }
      if (day5.tempMin == 0 || day5.tempMin > cast.main.temp_min) {
          day5.tempMin = cast.main.temp_min;
        }

      if (day5.humidity == 0 || day5.humidity < cast.main.humidity) {
        day5.humidity = cast.main.humidity;
      }
          day5.description = cast.weather[0].description;
          day5.date = formatDate.getMonth()+1+"/"+formatDate.getDate()+"/"+formatDate.getFullYear();
         break;
      }

    }
    
    $("#day1_title").html(day1.date);
    $("#day1").append("<ul> <li>High: "+day1.tempMax+"</li><li> Low: "
    +day1.tempMin+"</li><li>Humidity: "+day1.humidity+"</li><li>"+day1.description+"</li></ul>");
    
    $("#day2_title").html(day2.date);
    $("#day2").append("<ul> <li>High: "+((day2.tempMax - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li> Low: "+
    ((day2.tempMin - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li>Humidity: "+day2.humidity+"%</li><li>"+day2.description+"</li></ul>"); 

    $("#day3_title").html(day3.date);
    $("#day3").append("<ul> <li>High: "+((day3.tempMax - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li> Low: "+
    ((day3.tempMin - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li>Humidity: "+day3.humidity+"%</li><li>"+day3.description+"</li></ul>"); 

    $("#day4_title").html(day4.date);
    $("#day4").append("<ul> <li>High: "+((day4.tempMax - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li> Low: "+
    ((day4.tempMin - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li>Humidity: "+day4.humidity+"%</li><li>"+day4.description+"</li></ul>");
    
    $("#day5_title").html(day5.date);
    $("#day5").append("<ul> <li>High: "+((day5.tempMax - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li> Low: "+
    ((day5.tempMin - 273.15) * 9/5 + 32).toFixed(1)+String.fromCharCode(176)+"F</li><li>Humidity: "+day5.humidity+"%</li><li>"+day5.description+"</li></ul>"); 



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
      let duration = data.activities[i].duration / 60;
      //let lastRep = data.potholes[i].lastReporte;
      let cal = data.activities[i].calsBurned.toFixed(1);
      let temp = data.activities[i].temp;
      let humid = data.activities[i].humid;
      
      let cardHTML = "<div class=\"card\"><div class=\"card-body\">"
      cardHTML += "<h5 class=\"card-title\" id=\"type\">"+type+"</h5><h6 class=\"card-subtitle mb-2 text-muted\" id=\"duration\">";
      cardHTML += duration+" min</h6><p class=\"card-text\">Temperature: "+temp.toFixed(1)+String.fromCharCode(176)+"F Humidity: "+humid+"%";
      cardHTML += "</p><table class=\"table\"><tbody><tr><td>Calories:</td><td id=\"calories\">"+cal+"</td></tr><tr><td>Speed:";
      cardHTML += " </td><td id=\"speed\">"+speed+"</td></tr><tr><td>UV:</td><td id=\"uv\">"+uv+"</td></tr></tbody></table>";
      cardHTML += "<button id = \""+firstRep+"\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\">More Info</button>";
      cardHTML +="</div></div>";

      $("button").click(myCallback);
      
      let todayDate = new Date();
      let firstRepDate = new Date(firstRep);
      let todayWeek = todayDate.getDay();
      let firstRepWeek = firstRepDate.getDay();

      if (todayWeek == 0) { todayWeek = 7; }
      if (firstRepWeek == 0) { firstRepWeek = 7; } //change to 7 for sundays.
      
  switch(Math.abs(todayWeek - firstRepWeek)) {
    case 0:                      //sunday
      //change page
      $("#todayCards").append(cardHTML);

      break;

    case 1:
      //change page
      $("#yesterdayCards").append(cardHTML);
      break;

    case 2:
      $("#twoDaysAgoCards").append(cardHTML);     
      break;

    case 3:
      $("#threeDaysAgoCards").append(cardHTML);   
      break;

    case 4:
      $("#fourDaysAgoCards").append(cardHTML);

      break;
      
    case 5:
      $("#fiveDaysAgoCards").append(cardHTML); 
      break;

    case 6:
      $("#sixDaysAgoCards").append(cardHTML);
      break;
  }

      //$("#todayCards").append(cardHTML);


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
     $("button").click(myCallback);
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
  getForecastData(); //gets forecast for next 5 days


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
function myCallback() {
  //console.log(this);
  id = this.id;

  //window.location.search = this.id;
  window.location.replace("oneActivity.html?activity="+this.id);
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


  // Register event listeners here instead of in init?
});
