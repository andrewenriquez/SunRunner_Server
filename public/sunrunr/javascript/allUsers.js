

  function getRecentData() {
    //console.log("recent button pressed");
   $.ajax({
     url: '/data/global',
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
  
      $("#total_uv").html(data.totalUV.toFixed(1)+" mW/cm2");
      $("#total_min").html((data.totalDuration / 60 )+" mins");
      $("#total_cals").html(data.totalCals.toFixed(1)+" Cals");
      //looping through all potholes and concatenating them to a list.
       for (var i = data.activities.length - 1; i >= 0; i--) {
  
        let speed = data.activities[i].averageSpeed.toFixed(1);
        let uv = data.activities[i].averageUV.toFixed(1);
        let type = data.activities[i].activityType;
        let firstRep = data.activities[i].date;
        firstRep = new Date(firstRep);
        let duration = data.activities[i].duration / 60;
        //let lastRep = data.potholes[i].lastReporte;
        let cal = data.activities[i].calsBurned.toFixed(1);
        let temp = data.activities[i].temp;
        temp = temp.toFixed(1)+String.fromCharCode(176);
        let humid = data.activities[i].humid;
        let deviceId = data.activities[i].deviceId;
        
        let cardHTML = "<div class=\"col-sm-10 col-md-3 col-lg-4\"><div class=\"mt-4\"><div class=\"card\"><div class=\"card-body\">"
        cardHTML += "<h5 class=\"card-title\" id=\"type\">"+type+"</h5><h6 class=\"card-subtitle mb-2 text-muted\">Device ID: ";
        cardHTML += deviceId+" </h6><p class=\"card-text\">Date: "+firstRep;
        cardHTML += "</p><table class=\"table\"><tbody><tr><td>Calories:</td><td id=\"calories\">"+cal+"</td></tr><tr><td>Speed:";
        cardHTML += " </td><td id=\"speed\">"+speed+"</td></tr><tr><td>UV:</td><td id=\"uv\">"+uv+"</td></tr>"
        + "<tr><td>Duration: </td><td>"+duration+" mins</td></tr>"
        + "<tr><td>Temp: </td><td>"+temp+" F</td></tr>"
        + "<tr><td>Humidity: </td><td>"+humid+" %</td></tr></tbody></table>";
        cardHTML += "<button id = \""+firstRep+"\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\">More Info</button>";
        //cardHTML += 
        cardHTML +="</div></div></div></div>";
  
        $("button").click(myCallback);
        
        let todayDate = new Date();
        let firstRepDate = new Date(firstRep);
        let todayWeek = todayDate.getDay();
        let firstRepWeek = firstRepDate.getDay();
  
        if (todayWeek == 0) { todayWeek = 7; }
        if (firstRepWeek == 0) { firstRepWeek = 7; } //change to 7 for sundays.
  
        $("#sum").append(cardHTML);
        
  
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
    getRecentData();
  }
 
  // Register event listeners here instead of in init?
});
