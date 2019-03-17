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

$(document).ready(function(){
    console.log("document is ready");

    $("#submit").on("click", function(){
        if(debug){console.log("EVENT: Clicked to submit a new train schedule")}
        event.preventDefault();

        newTrainSchedule.name = $("#name-input").val().trim().toLowerCase();
        newTrainSchedule.destination = $("#destination-input").val().trim().toLowerCase();
        newTrainSchedule.startTime = $("#start-input").val();
        newTrainSchedule.frequency = $("#frequency-input").val();

        if(debug){console.log(newTrainSchedule)}
        AddNewTrainSchedule();
    });
});


function AddNewTrainSchedule() {
    if(debug){console.log("Function: AddNewTrainSchedule ")}
    // TODO:qualify that all required are correct before proceeding
    checkIfTrainScheduleIsValid();
    // TODO: show an message if there is an error with any of the inputs
    // TODO: clear the form if all info are correct, clear error message, reset all text colors to black

    // TODO: push this new train schedule to your array of train schedules
    // TODO: save the array to firebase
    // TODO: retrieve array from firebase using realtime feedback
    // TODO: calculate and refresh current train schedules
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