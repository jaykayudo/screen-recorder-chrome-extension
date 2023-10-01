const mainStartButton = document.getElementById("mainStartButton")
const audioCheckButton = document.getElementById("audioCheck")
const cameraCheckButton = document.getElementById("cameraCheck")

async function mainStart(){

    console.log("Audio Check: " + audioCheckButton.checked)
    console.log("Camera Check: " + cameraCheckButton.checked)
    chrome.runtime.sendMessage({type:"startRecording",audioCheck: audioCheckButton.checked, cameraCheck: cameraCheckButton.checked})
      
}
mainStartButton.addEventListener("click", mainStart)

