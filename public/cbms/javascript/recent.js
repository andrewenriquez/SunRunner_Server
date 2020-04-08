//import { get } from "mongoose";

let map = null;

let id = "123";

function getRecentData() {
   //console.log("recent button pressed");
  $.ajax({
    url: '/batteries/bmsdata',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json',
    contentType: 'application/json',
  })
    .done(displayMostRecentData)
    .fail(recentPotholeError);

}

//makes call for forecas
function displayMostRecentData(data, textSatus, jqXHR) {

  
  let activityReport = "No activities have been reported this week.";
   if (data.dataEntries.length > 0) {
    console.log(data.dataEntries.length);
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
    //$("button").click(myCallback);

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



// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  getRecentData();

  // Register event listeners here instead of in init?
});
