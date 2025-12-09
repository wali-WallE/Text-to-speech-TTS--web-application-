const supportsSpeechSynthesis = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

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

