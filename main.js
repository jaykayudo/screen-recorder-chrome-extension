 function getTabId() { 
    // const tabs = await 
    
}

function mainstartRecording(){
    chrome.tabs.query({ active: true, currentWindow: true },function(tabs){
        const activeTab = tabs[0];
        const tabId = activeTab.id;
    
        chrome.scripting.executeScript({
        target : {tabId : tabId},
        // func: function(){
        //     console.log(document.title)
        //     return document.title
            
        // },
        files : [ "script.js" ],

        })
        .then(() => console.log("script injected"));
        }) 
   
}
document.getElementById("mainStartButton").addEventListener("click", function(){
    console.log("Starting")
    mainstartRecording()
})