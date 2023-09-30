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

let startButton;
let stopButton;
let cameraButton;
let micButton;
let playText;
let timerElement;
let scrDot; 

const mainStartButton = document.getElementById("mainStartButton")


const injector = `
<div id="injectCode">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="style.css">
    <div class="scr-bottom-bar-cover">
        <div class="scr-bottom-bar">
            <div class="scr-timer-box">
                <div class="scr-timer" ><span id="timer-element">00:00:00</span><span class="scr-dot" id="scrDot"></span></div>  
            </div>
            <div id="screenRecordControls" class="scr-controls">
            <div class="scr-btn-group">
                <button id="startButton" class="scr-record-btn" type="button"><i class="fas fa-play"></i></button>
                <span class="scr-btn-text" id="scrPlayText">Play</span>
            </div>
            <div class="scr-btn-group">
                <button id="stopButton" class="scr-record-btn" type="button"><i class="fas fa-stop"></i></button>
                <span class="scr-btn-text">Stop</span>
            </div>
            <div class="scr-btn-group">
                <button id="cameraButton" class="scr-record-btn" type="button"><i class="fas fa-video"></i></button>
                <span class="scr-btn-text">Camera</span>
            </div>
            <div class="scr-btn-group">
                <button id="micButton" class="scr-record-btn" style="font-size: 16px;" type="button"><i class="fas fa-microphone" ></i></button>
                <span class="scr-btn-text">Mic</span>
            </div>
            <div class="scr-btn-group">
                <button id="deleteButton" class="scr-record-btn src-del-btn" type="button"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        </div>
        </div>
</div>
`


let hour = 0
let minutes = 0
let second = 0
let timerInterval;
let muted = false;



async function startRecording(){
    

    chrome.desktopCapture.chooseDesktopMedia(['screen'], async (streamId) => {
    const options = { audio: false, video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: streamId } } };

    stream = await navigator.mediaDevices.getUserMedia(options);
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
        console.log("Started")
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
        const form = new FormData()
        form.append("video",blob)

        chunks = [];
        audioStream.getTracks().forEach((tracks)=>tracks.stop())
        stream.getTracks().forEach((tracks)=>tracks.stop())
        resetAll();
    })
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
    
    }
    })
}
async function mainStart(){
    
    hasStarted = true;
   
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

    const activeTab = tabs[0];
    const tabId = activeTab.id;
  
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: function () {
            const divObject = document.createElement("div")
            divObject.innerHTML = injector;
            document.body.appendChild(divObject); 
            startButton = document.getElementById("startButton")
            stopButton = document.getElementById("stopButton")
            cameraButton = document.getElementById("cameraButton")
            micButton = document.getElementById("micButton")
            playText = document.getElementById("scrPlayText")
            timerElement = document.getElementById("timer-element")
            scrDot = document.getElementById("scrDot")         
        },
      },
      () => {
        // Script executed
      }
    );
  });  
    await startRecording();
}
mainStartButton.addEventListener("click", mainStart)

