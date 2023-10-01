async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}
chrome.action.onClicked.addListener(function(tab) {
    console.log("it is happing")
    chrome.scripting.executeScript({
        target: {tabId:tab.id},
        func: function(){
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
                                                    <button id="deleteButton" class="scr-record-btn src-del-btn" id="scrDeleteButton" type="button"><i class="fas fa-trash-alt"></i></button>
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
                        let deleteButton;
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
        }

    })
 });
chrome.runtime.onMessage.addListener(async (message,sender, response)=>{
    console.log("Messsage Recieved")
    if(message.type == "startRecording"){
        let activeTab = await getActiveTabURL()
        const streamId = 1
        chrome.tabs.sendMessage(activeTab.id,{type:"responseStartRecording",streamId: streamId})
    }
})