'use strict'

var debug = true;

var trainSked = {
     name: ""
    ,destination: ""
    ,startTime: 0
    ,frequency: 0
};
var trainInfo = {
    list: []
};

$(document).ready(function(){
    console.log("document is ready");

    $("#submit").on("click", function(){
        if(debug){console.log("EVENT: Clicked to submit a new train schedule")}
        event.preventDefault();
        var name, destination, startTime, frequency;

        name = $("#name-input").val().trim().toLowerCase();
        destination = $("#destination-input").val().trim().toLowerCase();
        startTime = $("#start-input").val();
        frequency = $("#frequency-input").val();

        if(debug){console.log(name, destination, startTime, frequency)}
    });
});