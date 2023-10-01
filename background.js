async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

chrome.runtime.onMessage.addListener(async (message,sender, response)=>{
    console.log("Messsage Recieved")
    if(message.type == "startRecording"){
        let activeTab = await getActiveTabURL()
        const streamId = 1
        chrome.tabs.sendMessage(activeTab.id,{type:"responseStartRecording",streamId: streamId})
    }
})