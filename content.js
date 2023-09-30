// document.getElementById('start').addEventListener('click', () => {
//     chrome.desktopCapture.chooseDesktopMedia(['screen'], (streamId) => {
//       const options = { audio: false, video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: streamId } } };
//       navigator.mediaDevices.getUserMedia(options)
//         .then((stream) => {
//           const mediaRecorder = new MediaRecorder(stream);
//           mediaRecorder.start();
  
//           mediaRecorder.ondataavailable = (event) => {
//             const blob = new Blob([event.data], { type: 'video/webm' });
//             const url = URL.createObjectURL(blob);
  
//             // Now, you can do something with the recorded video (e.g., upload it to a server)
//           }
//         })
//         .catch((error) => {
//           console.error('Error accessing user media:', error);
//         });
//     });
// 
let hasStarted = false
let play = false
let mediaRecorder = null
let stream = null
let audioStream = null
let mixedStream = null


const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")
const cameraButton = document.getElementById("cameraButton")
const micButton = document.getElementById("micButton")
const playText = document.getElementById("scrPlayText")
const timerElement = document.getElementById("timer-element")
const scrDot = document.getElementById("scrDot")



let hour = 0
let minutes = 0
let second = 0
let timerInterval;
let muted = false;



async function startRecording(){
    stream = await navigator.mediaDevices.getDisplayMedia({video: true});
    audioStream = await navigator.mediaDevices.getUserMedia({audio:{
        echoCancellation: true,
        sampleRate: 44100,
        noiseSuppression: true
    }})

  
    if(stream && audioStream){
    mixedStream = new MediaStream([...stream.getTracks(),...audioStream.getTracks()])
    
    // const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9":"video/webm";
    mediaRecorder = new MediaRecorder(mixedStream);
    mediaRecorder.start();
    let chunks = []
    mediaRecorder.addEventListener("dataavailable", function(e){
        chunks.push(e.data);
    })
    mediaRecorder.addEventListener("start", function(e){
        hasStarted = true
        play = true;
        startButton.innerHTML ='<i class="fa fa-pause"></i>'
        playText.textContent = "Pause"
        starttimer();
        startBlinky();
    })
    mediaRecorder.addEventListener("resume", function(e){
        // Event called when the 
        play = true;
        startButton.innerHTML ='<i class="fa fa-pause"></i>'
        playText.textContent = "Pause"
        starttimer();
        startBlinky();
    })
    mediaRecorder.addEventListener("pause",function(){
        // EVent called when the screen recording is paused
        play = false;
        startButton.innerHTML ='<i class="fa fa-play"></i>'
        playText.textContent = "Play"
        pauseTimer();
        stopBlinky();
    })
    mediaRecorder.addEventListener("stop",function(e) {
        let blob = new Blob(chunks,{type:"video/mp4"});
        play = false;
        startButton.innerHTML ='<i class="fa fa-play"></i>'
        playText.innerHTML = "Play"
        stopTimer();
        stopBlinky();

        let recordUrl = URL.createObjectURL(blob);
        let video = document.getElementById("video");
        video.src = recordUrl;
        video.play();

        let downloadLink = document.createElement("a")
        downloadLink.innerHTML = '<i class="fas fa-download"></i>&nbsp; Download Recording';
        downloadLink.href = recordUrl;
        downloadLink.download = "video.mp4";
        downloadLink.classList.add("download-button")
        
        document.getElementById("download-box").appendChild(downloadLink);
        chunks = [];
        audioStream.getTracks().forEach((tracks)=>tracks.stop())
        stream.getTracks().forEach((tracks)=>tracks.stop())
        resetAll();
    })
    

}
}
async function playRecording(){
    // if (mediaRecorder instanceof MediaRecorder){
        if (hasStarted){
            mediaRecorder.resume();
            
            play = true;
            startButton.innerHTML ='<i class="fa fa-pause"></i>'
            playText.innerHTML = "Pause"
        }else{
            await startRecording();
            mediaRecorder.ondataavailable = function(){
                hasStarted = true
                play = true;
                startButton.innerHTML ='<i class="fa fa-pause"></i>'
                playText.innerHTML = "Pause"
            }
        }
      
       
    // }else{
    //     console.log("Could not Pause")
    // }
}
function pauseRecording(){
    mediaRecorder.pause();
}
function stopRecording(){
    mediaRecorder.stop();
}
function resetAll(){
    hasStarted = false
    play = false
    mediaRecorder = null
    stream = null
    audioStream = null
    mixedStream = null
    hour = 0
    minutes = 0
    second = 0
    timerInterval;
    muted = false;
}
function toggleAudio(){
    if(audioStream){
        if(muted){
            audioStream.getTracks().forEach((tracks)=>{
                tracks.enabled = true
            })
            muted = false
            micButton.innerHTML = '<i class="fas fa-microphone"></i>'
        }else{
            audioStream.getTracks().forEach((tracks)=>{
                tracks.enabled = false
            })
            muted = true
            micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>'
        }
    }
}


function startBlinky(){
    scrDot.classList.add("blinky");
}
function stopBlinky(){
    scrDot.classList.remove("blinky");
}
function starttimer(){
    timerInterval = setInterval(()=>{
        if(second < 60){
            second += 1
            
        }else{
            second = 0
            if(minutes > 59){
                minutes = 0
                hour += 1
            }else{
                minutes += 1
            }
        }
        let hourtext = String(hour).padStart(2, '0');
        let minutestext = String(minutes).padStart(2, '0');
        let secondtext = String(second).padStart(2, '0');
        timerElement.textContent = `${hourtext}:${minutestext}:${secondtext}`;

    },1000)
}
function pauseTimer(){
    clearInterval(timerInterval)
}
function stopTimer(){
    clearInterval(timerInterval)
    hour = 0
    minutes = 0
    second = 0
    let hourtext = String(hour).padStart(2, '0');
    let minutestext = String(minutes).padStart(2, '0');
    let secondtext = String(second).padStart(2, '0');
    timerElement.textContent = `${hourtext}:${minutestext}:${secondtext}`;
}



startButton.addEventListener("click", function(){
    if(hasStarted){
        if (play){
        pauseRecording();
        }else{
            playRecording();
            startButton.innerHTML ='<i class="fas fa-pause"></i>'
            playText.innerHTML = "Pause"
        }
    }else{
        hasStarted = true
        startRecording()
    }
    
});
stopButton.addEventListener("click",stopRecording);
micButton.addEventListener("click",toggleAudio);

async function mainStart(){
    const divObject = document.createElement("div")
    divObject.innerHTML = injector;
    document.body.appendChild(divObject);
    hasStarted = true;
    startRecording();
}
mainStartButton.addEventListener("click", mainStart)

