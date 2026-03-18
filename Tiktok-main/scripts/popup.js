var idButton = document.getElementById("id-button");
if(idButton != null){
    idButton.addEventListener("click", idClickSubmit);
}

function idClickSubmit()
{
    var userId = document.getElementById("user-id").value;
    const confirmed = confirm("Please click 'OK' to confirm that you are logged in to your personal Tiktok account and '" + userId + "' is your correct Prolific ID. If not, please click 'cancel', login(if needed), and re-enter it. \n\nThis must be correct in order for us to pay you for your time!");


    console.log(confirmed);
    if(confirmed){
        window.close();
        chrome.tabs.query(
            {active: true, currentWindow: true}, 
            function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {"message": "submitted_valid_id", "user_id": userId});
        });
    }
}