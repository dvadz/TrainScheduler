'use strict'

var debug = true;

var newTrainSchedule = {
     name: ""
    ,destination: ""
    ,startTime: 0
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

// EVENT handlers
$(document).ready(function(){
    console.log("document is ready");

    //SUBMIT
    $("#submit").on("click", function(){
        if(debug){console.log("EVENT: Clicked to submit a new train schedule")}
        event.preventDefault();

        newTrainSchedule.name = $("#name-input").val().trim().toLowerCase();
        newTrainSchedule.destination = $("#destination-input").val().trim().toLowerCase();
        newTrainSchedule.startTime = $("#start-input").val();
        newTrainSchedule.frequency = $("#frequency-input").val();

        if(debug){console.log("New train schedule pulled from the form", newTrainSchedule)}
        AddNewTrainSchedule();
    });

    //FIREBASE child added
    database.ref().on("child_added", function(snapshot){
        console.log("EVENT: Firebase - child added");
        console.log("Snapshot: ", snapshot);
        console.log(snapshot.val());
    });
});

function AddNewTrainSchedule() {
    if(debug){console.log("Function: AddNewTrainSchedule ")}
    checkIfTrainScheduleIsValid();
    if(trainInfo.isTrainInfoComplete===false) {
        if(debug){console.log("New train schedule is NOT complete")}
        return false;
    }    
    saveToFirebase();
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
    if(newTrainSchedule.destination<3){
        errorMessage = $("<p></p>").text('"Destinaton" must have at least 3 characters');
        $("#error-messages").append(errorMessage);
        trainInfo.isTrainInfoComplete = false;
    }
    //start time must be provided
    if(newTrainSchedule.startTime===""){
        errorMessage = $("<p></p>").text('"First Train Time" must be provided');
        $("#error-messages").append(errorMessage);
        trainInfo.isTrainInfoComplete = false;
    }
    //frequency must be provided
    if(newTrainSchedule.frequency===""){
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
        ,startTime: newTrainSchedule.startTime
        ,frequency: newTrainSchedule.frequency
    });
}