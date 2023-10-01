
(()=>{
 chrome.runtime.onMessage.addListener(async (message,sender, sendResponse)=>{
        if(message.type == "responseStartRecording"){
            console.log("Recording response recieved. recording started");
            const streamId = message.streamId;
            if (streamId){
                const divObject = document.createElement("div");
                        divObject.id = "scrInjector"
                        const injector = `
                                    <div id="injectCode">
                                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                                        <link rel="stylesheet" href="style.css">
                                        <div class="scr-main-cover" id="scRDraggableBox">
                                        <div class="scr-bottom-bar-cover" >
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
                                    </div>
                                    `
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
                        let hour = 0
                        let minutes = 0
                        let second = 0
                        let timerInterval;
                        let muted = false;
            
                        divObject.innerHTML = injector;
                        document.body.appendChild(divObject);
                        // if (!document.getElementById("scrInjector")){
                             
                        // }
                        
                        // Shadow Root
                        let host = document.getElementById("scrInjector")
                        // let root = host.attachShadow({mode: 'open'})
                        let styleDiv = document.createElement("div")
                        styleDiv.innerHTML = `
            <style>
            .scr-record-btn{
                outline: none;
                border: none;
                font-size: 13px;
                background-color: white;
                width: 40px;
                height: 40px;
                border-radius: 32px;
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 5px;
                transition: 0.5s;
                cursor: pointer;
            }
            .scr-record-btn:hover{
                background-color: rgba(141, 141, 141, 0.911);
            }
            .scr-record-btn:disabled{
                background-color: rgba(110, 110, 110, 0.815);
            }
            
            .scr-bottom-bar{
                background-color: #141414;
                color: white;
                display: flex;
                padding: 10px 20px;
                border-radius: 40px;
                flex-direction: row;
                
            }
            .scr-main-cover{
                position: fixed;
                bottom: 10px;
                left: 20px;
                z-index: 100000;
            }
            .scr-bottom-bar-cover{
                background-color: #6262622B;
                border-radius: 40px;
                padding: 5px;
                
            }
            .scr-timer-box{
                border-right: 1px solid white;
                padding: 0 10px;
                font-size: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .scr-dot{
                display: inline-block;
                width: 10px;
                height: 10px;
                background-color: red;
                border: 4px solid rgba(255, 0, 0, 0.34);
                border-radius: 50%;
                margin-left: 5px;
            }
            .scr-controls{
                padding: 0 15px;
                display: flex;
            }
            .scr-btn-group{
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                margin-right: 10px;
            }
            .scr-btn-group > .scr-btn-text{
                font-size: 12px;
                color: white;
            }
            .src-del-btn{
                background-color: #4B4B4B;
                color: #BEBEBE;
            }
            .scr-timer{
                display: flex; 
                justify-content: center; 
                align-items: center;
            }
            @keyframes blinkDot {
                0%{
                    opacity: 1;
                }
                100%{
                    opacity: 0.4;
                }
            }
            .blinky{
                animation: blinkDot 1s alternate 0s infinite linear;
            }
            </style>
                        `
                        host.prepend(styleDiv)
                        
                        startButton = document.getElementById("startButton")
                        stopButton = document.getElementById("stopButton")
                        cameraButton = document.getElementById("cameraButton")
                        micButton = document.getElementById("micButton")
                        playText = document.getElementById("scrPlayText")
                        timerElement = document.getElementById("timer-element")
                        scrDot = document.getElementById("scrDot")
                        await startRecording();
                        function dragger(){
                
                            const draggableButton = document.getElementById("scRDraggableBox");
                            let isDragging = false;
                            let offsetX, offsetY;
            
                            draggableButton.addEventListener("mousedown", (event) => {
                                isDragging = true;
                                offsetX = event.clientX - draggableButton.getBoundingClientRect().left;
                                offsetY = event.clientY - draggableButton.getBoundingClientRect().top;
                                draggableButton.style.cursor = "grabbing";
                            });
            
                            document.addEventListener("mousemove", (event) => {
                                if (!isDragging) return;
            
                                const newX = event.clientX - offsetX;
                                const newY = event.clientY - offsetY;
            
                                draggableButton.style.left = newX + "px";
                                draggableButton.style.top = newY + "px";
                            });
            
                            document.addEventListener("mouseup", () => {
                                if (isDragging) {
                                    isDragging = false;
                                    draggableButton.style.cursor = "grab";
                                }
                            });
                
            
                        }
                        dragger()
                        
                        async function startRecording(){
                            if(!streamId){
                                return
                            }
                            const options = { audio: {audio:{
                                echoCancellation: true,
                                sampleRate: 44100,
                                noiseSuppression: true
                            }},
                            video: { mandatory: { 
                                chromeMediaSource: 'desktop', 
                                chromeMediaSourceId: streamId
                            }}};
                            
                        
                            stream = await navigator.mediaDevices.getDisplayMedia({'video':true});
                            audioStream = await navigator.mediaDevices.getUserMedia({audio: {audio:{
                                echoCancellation: true,
                                sampleRate: 44100,
                                noiseSuppression: true
                            }}})
                            console.log("Printing Stream")
                            console.log(stream)
                            
                            if(stream && audioStream){
                            mixedStream = new MediaStream([...stream.getTracks(),...audioStream.getTracks()])
                            console.log("Stream Started")
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
                        
                        }
            }
        }
    })

})();