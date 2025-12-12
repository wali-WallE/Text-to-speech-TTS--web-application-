const supportsSpeechSynthesis = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

// button and input references
const textinput = document.getElementById("text-input");
const voiceselect = document.getElementById("voice-select");
const voiceHint = document.getElementById("voice-hint");
const ratevalue = document.getElementById("rate-value");
const rate= document.getElementById("rate");
const pitchvalue= document.getElementById("pitch-value");
const pitch= document.getElementById("pitch");
const playbtn = document.getElementById("play-btn");
const pausebtn = document.getElementById("pause-btn");
const resumebtn = document.getElementById("resume-btn");
const stopbtn = document.getElementById("stop-btn");
const stat = document.getElementById("status");

let voices = [];
let currentUtterance = null;

function setStatus(message){
    stat.textContent = message;
}

// function for managing button states
function CurrentState(state){
    if(state === "idle"){
        playbtn.disabled = false;
        pausebtn.disabled = true;
        stopbtn.disabled = true;
        resumebtn.disabled = true;
    }
    else if(state === "playing"){
        playbtn.disabled = true;
        pausebtn.disabled = false;
        resumebtn.disabled = true;
        stopbtn.disabled = false;
    }
    else if(state === "stopped"){
        playbtn.disabled = true;
        pausebtn.disabled = true;
        resumebtn.disabled = false;
        stopbtn.disabled = false;
    }
}

// function to populate available voices from Api
function populateVoices(){
    if (!supportsSpeechSynthesis) return;

    voices = window.speechSynthesis.getVoices();
    voiceselect.innerHTML = "";

    if(!voices.length){
        const option = document.createElement("option");
        option.textContent = "No voices Available!";
        option.disabled = true;
        option.selected = true;
        voiceselect.appendChild(option);
        voiceHint.textContent = "Try refreshing the page or checking your browser settings."; 
        return;
    }

    voices
        .filter((voice)=> voice.lang.toLocaleLowerCase().startsWith("en") || voice.default)
        .forEach((voice, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})${voice.default ? " — Default" : ""}`;
            voiceselect.appendChild(option);
        });
    
    if(voiceselect.options.length > 0){
        voiceselect.selectedIndex = 0;
    }
    
}

// FUNCTION TO START SPEAKING
function speak(){
    if (!supportsSpeechSynthesis) {
    setStatus("Sorry, your browser does not support speech synthesis.");
    return;
    }

    const text = textinput.value.trim();
    if (!text) {
    setStatus("Please type something to speak.");
    textinput.focus();
    return;
    }

    window.speechSynthesis.cancel();
    currentUtterance = new SpeechSynthesisUtterance(text);

    const selectedIndex = parseInt(voiceselect.value, 10);    
    if(! Number.isNaN(selectedIndex) && voices[selectedIndex] ){
        currentUtterance.voice = voices[selectedIndex];
    }

    currentUtterance.rate = parseFloat(rate.value);
    currentUtterance.pitch = parseFloat(pitch.value);

    currentUtterance.onstart = () => {
        setStatus("Speaking.....");
        CurrentState("playing");
    }

    currentUtterance.onend = () => {
        setStatus("Stopped.");
        CurrentState("idle");
        textinput.value = "";
    }

    currentUtterance.onerror = () => {
        setStatus("an ERROR occured while playing the sound!");
        CurrentState("idle");
    }

    window.speechSynthesis.speak(currentUtterance);
}

// FUNCTION TO PAUSE SPEAKING
function pauseSpeech() {
    if (!supportsSpeechSynthesis) return;
    if(window.speechSynthesis.speaking && !window.speechSynthesis.paused){
        window.speechSynthesis.pause();
        setStatus("Paused!");
        CurrentState("stopped");
    }
}

// FUNCTION TO RESUME SPEAKING
function ResumePlaying() {
    if (!supportsSpeechSynthesis) return;
    if(window.speechSynthesis.paused){
        window.speechSynthesis.resume();
        setStatus("Speaking...");
        CurrentState("playing");
    }
}

// FUNCTION TO STOP SPEAKING
function StopSpeech() {
    if (!supportsSpeechSynthesis) return;
    if(window.speechSynthesis.speaking){
        window.speechSynthesis.cancel();
        setStatus("Stopped.");
        CurrentState("idle");
        textinput.value = "";
    }
}


function updateRateLabel() {
  ratevalue.textContent = `${parseFloat(rate.value).toFixed(1)}x`;
}

function updatePitchLabel() {
  pitchvalue.textContent = parseFloat(pitch.value).toFixed(1);
}

// Event Listeners
playbtn.addEventListener("click", speak);
pausebtn.addEventListener("click", pauseSpeech);
resumebtn.addEventListener("click", ResumePlaying);
stopbtn.addEventListener("click", StopSpeech);


rate.addEventListener("input", updateRateLabel);
pitch.addEventListener("input", updatePitchLabel);

textinput.addEventListener("keydown", (event) => {
    if(event.key === "Enter" && (event.ctrlKey || event.metaKey)){
        event.preventDefault();
        speak();
    }
});

// Initialization function
function init(){
    if(!supportsSpeechSynthesis){
        setStatus("Your browser does not support the web API model!");
        playbtn.disabled = true;
        pausebtn.disabled = true;
        stopbtn.disabled = true;
        resumebtn.disabled = true;
        return;
    }

    setStatus("Ready. Type some text and press Play");
    CurrentState("idle");
    updateRateLabel();
    updatePitchLabel();
    
    
    populateVoices();

    if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
}

document.addEventListener("DOMContentLoaded", init);

