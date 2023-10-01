const mainStartButton = document.getElementById("mainStartButton")
const audioCheckButton = document.getElementById("audioCheck")
const cameraCheckButton = document.getElementById("cameraCheck")

async function mainStart(){
    chrome.runtime.sendMessage({type:"startRecording"})
      
}
mainStartButton.addEventListener("click", mainStart)

