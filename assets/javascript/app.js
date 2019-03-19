'use strict'

var debug = false;
var updateInterval;

var newTrainSchedule = {
     name: ""
    ,destination: ""
    ,startTimeInMinutes: 0
    ,frequency: 0
};

var trainInfo = {
    list: []
    ,isTrainInfoComplete: true
};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDXFPpfiZpX_y1hU9wN0qWmwtlNJoqHHts",
    authDomain: "dvadz-trainscheduler.firebaseapp.com",
    databaseURL: "https://dvadz-trainscheduler.firebaseio.com",
    projectId: "dvadz-trainscheduler",
    storageBucket: "dvadz-trainscheduler.appspot.com",
    messagingSenderId: "42799066100"
};

firebase.initializeApp(config);
var database = firebase.database();

// EVENT handlers -----------------------------------------------------------
$(document).ready(function(){
    console.log("document is ready");

    //SUBMIT
    $("#submit").on("click", function(){
        if(debug){console.log("EVENT: Clicked to submit a new train schedule")}
        event.preventDefault();
        retrieveTrainInfoFromTheForm();
        if(debug){console.log("New train schedule pulled from the form", newTrainSchedule)}
        AddNewTrainSchedule();
    });

    //FIREBASE child added
    //firebase sends all children when the app is started/refreshed
    //then firebase sends back only the child that was recently added
    database.ref().on("child_added", function(snapshot){
        console.log("EVENT: Firebase - child added");
        console.log("Snapshot: ", snapshot);
        //kill the 1 minute interval 
        stopOneMinuteInterval();
        //store the snapshot values into the holding object for eventual array storage
        var scheduleFromFirebase = snapshot.val();
        //insert a new key > set the initial: arrival = start
        scheduleFromFirebase.arrivalTimeInMinutes = scheduleFromFirebase.startTimeInMinutes;
        //insert a new key > minutesAway
        scheduleFromFirebase.minutesAway = 0;
        if(debug){console.log(scheduleFromFirebase);}
        trainInfo.list.push(scheduleFromFirebase);
        postThisSchedule(trainInfo.list.length - 1);
        //restart the 1 minute interval to refresh train arrivals
        startOneMinuteInterval();
    });
});

function AddNewTrainSchedule() {
    if(debug){console.log("Function: AddNewTrainSchedule", newTrainSchedule)}
    checkIfTrainScheduleIsValid();
    if(trainInfo.isTrainInfoComplete===false) {
        if(debug){console.log("New train schedule is NOT complete")}
        return false;
    }   
    clearTheForm();
    if(debug){console.log(newTrainSchedule);}
    saveToFirebase();
}

function retrieveTrainInfoFromTheForm(){
    if(debug){console.log("Function: retrieveTrainInfoFromTheForm")}
    //retrieve all info
    newTrainSchedule.name = $("#name-input").val().trim().toLowerCase();
    newTrainSchedule.destination = $("#destination-input").val().trim().toLowerCase();
    newTrainSchedule.startTimeInMinutes = convert_HHMM_ToMinutes($("#start-hour-input").val() + ":" + $("#start-minute-input").val() );
    newTrainSchedule.frequency = parseInt($("#frequency-input").val());
}

function clearTheForm(){
    if(debug){console.log("Function: clearTheForm")}
    $("#name-input").val("");
    $("#destination-input").val("");
    $("#start-hour-input").val("");
    $("#start-minute-input").val("");
    $("#frequency-input").val("");
}

function clearAllSchedules(){
    $("#schedule-display").empty();     
}

function checkIfTrainScheduleIsValid(){
    if(debug){console.log("Function: checkIfTrainScheduleIsValid")}
    var errorMessage = "";

    trainInfo.isTrainInfoComplete = true;
    $("#error-messages").empty();

    //train name must be at least 3 characters 
    if(newTrainSchedule.name.length<3){
        errorMessage = $("<p></p>").text('"Train Name" must have at least 3 characters');
        $("#error-messages").append(errorMessage);
        trainInfo.isTrainInfoComplete = false;
    }
    //destination must be at least 3 characters 
    if(newTrainSchedule.destination.length<3){
        errorMessage = $("<p></p>").text('"Destinaton" must have at least 3 characters');
        $("#error-messages").append(errorMessage);
        trainInfo.isTrainInfoComplete = false;
    }
    //start time must be provided
    if(isNaN(newTrainSchedule.startTimeInMinutes)){
        errorMessage = $("<p></p>").text('"First Train Time" must be provided');
        $("#error-messages").append(errorMessage);
        trainInfo.isTrainInfoComplete = false;
    }
    //frequency must be provided
    if(isNaN(newTrainSchedule.frequency)){
        errorMessage = $("<p></p>").text('"Frequency" must be provided');
        $("#error-messages").append(errorMessage);
        trainInfo.isTrainInfoComplete = false;
    }
}

function saveToFirebase(){
    if(debug){console.log("Function: savedToFirebase ")}

    database.ref().push({
         name: newTrainSchedule.name        
        ,destination: newTrainSchedule.destination
        ,startTimeInMinutes: newTrainSchedule.startTimeInMinutes
        ,frequency: newTrainSchedule.frequency
        ,dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
}

function postThisSchedule(arrayIndex){
    if(debug){console.log("Function: postThisSchedule")}
    
    var name, destination, frequency, arrivalTimeInHHMM, minutesAway;
    calculateNextArrivalTime(arrayIndex);
    //convert arrival time to HH:MM

    name = trainInfo.list[arrayIndex].name;
    destination = trainInfo.list[arrayIndex].destination;
    frequency = trainInfo.list[arrayIndex].frequency;
    arrivalTimeInHHMM = convert_Minutes_ToHHMM(trainInfo.list[arrayIndex].arrivalTimeInMinutes);
    minutesAway = trainInfo.list[arrayIndex].minutesAway;
    if(minutesAway===0) {
        arrivalTimeInHHMM = "Arrived";
    }

    var newEntry = `<div class="row m-2 justify-content-between train">
                        <div class="col-2 text-center">${name}</div>
                        <div class="col-2 text-center">${destination}</div>
                        <div class="col-2 text-center">${frequency}</div>
                        <div class="col-2 text-center">${arrivalTimeInHHMM}</div>
                        <div class="col-2 text-center">${minutesAway}</div>
                    </div>`;
    //append to the div                
    $("#schedule-display").append(newEntry);     
}

function calculateNextArrivalTime(arrayIndex){
    if(debug){console.log("Function: calculateNextArrivalTime");}

    //get the following from the object
    //startTimeInMinutes, arrivalTimeInMinutes, frequency
    var startTimeInMinutes = parseInt(trainInfo.list[arrayIndex].startTimeInMinutes);
    var arrivalTimeInMinutes = parseInt(trainInfo.list[arrayIndex].arrivalTimeInMinutes);
    var frequency = parseInt(trainInfo.list[arrayIndex].frequency);

    //get the CURRENT time in minutes
    var currentTimeInMinutes = (moment().hour()*60) + (moment().minute());
    
    // this is test code to fake the TOD   -----------------------------
    // var hours = $("#start-hour-input").val();
    // var minutes = $("#start-minute-input").val();
    // console.log(`hour: ${hours}  minutes ${minutes}`);
    // var currentTimeInMinutes = (parseInt(hours)*60) + parseInt(minutes);
    // =================================================================

    if(debug){console.log("currentTimeInMinutes: ", currentTimeInMinutes);}
    if(debug){console.log("startTimeInMinutes: ", startTimeInMinutes);}
    if(debug){console.log("arrivalTimeInMinutes: ", arrivalTimeInMinutes);}
    if(debug){console.log("Freq:", typeof frequency, frequency)}

    //calculate the next arrival time
    if(arrivalTimeInMinutes<currentTimeInMinutes){
        if(debug){console.log("1st scenario")}
            do {
                arrivalTimeInMinutes += frequency;
            } while(arrivalTimeInMinutes<currentTimeInMinutes)
    }
    // WARNING: Don't change the sequence below
    //calculate and save minutesAway
    trainInfo.list[arrayIndex].minutesAway = arrivalTimeInMinutes - currentTimeInMinutes;
    // check if arrival time is past midnight
    if(arrivalTimeInMinutes>=1440) {
        arrivalTimeInMinutes -= 1440;
    }
    if(debug){console.log("NEW arrivalTimeInMinutes: ", arrivalTimeInMinutes);}
    //save arrivaltime
    trainInfo.list[arrayIndex].arrivalTimeInMinutes = arrivalTimeInMinutes;
}

function convert_HHMM_ToMinutes(timeHHMM){
    var time = timeHHMM.split(':');
    var timeInMinutes = (parseInt(time[0])*60) + parseInt(time[1]);

    return timeInMinutes;
}

function convert_Minutes_ToHHMM(timeInMinutes) {
    
    var hours = Math.floor(timeInMinutes/60);
    var minutes = timeInMinutes%60;

    if(hours<10) {
        hours = '0' + hours;
    }
    if(minutes<10) {
        minutes = '0' + minutes;
    }

    return `${hours}:${minutes}`;
}

function updateTrainArrivals(){
    if(debug){console.log("Refreshing the train schedules")}
    
    clearAllSchedules();
    //update all trains schedules
    trainInfo.list.forEach(function(train,index){
        console.log(train, index)
        postThisSchedule(index);
    });
}

function startOneMinuteInterval(){
    if(debug){console.log("STARTED the interval")}
    updateInterval = setInterval(updateTrainArrivals, 60000);
}

function stopOneMinuteInterval(){
    if(debug){console.log("STOPPED the interval")}
    clearInterval(updateInterval);
}