chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "submitted_valid_id") {
            alertInstructions();
            if(!document.getElementById('progressBarContainer')){
                createProgressBar();
             }
            // check if logged in to TikTok
            checkLogin(request, sender, sendResponse);
            // create first set of survey
            createSurvey(request.user_id);
            // add FAQ overlay
            createOverlay();
            observe(request.user_id);
        }
    }
);

function checkLogin(request, sender, sendResponse){
    var login_elem = document.getElementById("header-login-button"); 
    //console.log(login_elem);
    if (login_elem != null){
        alert("Please Log In and re-start the extension");
    }
}

function alertInstructions()
{
    var introMsg = "Hello! Thank you for choosing to participate in this study\n\n";
    // var introInstructions = "To participate in this study, you will be asked to watch Tiktok videos and rate them as explicitly political, implicitly political, or neither along with an explanation of why you made that selection. You can feel free to skip videos and rate them in any order.\n\n"
    // var payMsg = "You will be paid 17 cents per video response submitted. We will be expecting a minimum of 20 video responses and will be paying for a maximum of 40 video responses. This will total around $5-8, including payment for setting up the tool. We expect this study will take around 15-25 minutes.\n"
    // var warningMsg = "Please note that we will be verifying responses and will not pay for responses that clearly don't show any effort.\n\n";
    // var impExpQ = 'Q: What do the ratings "explicitly political" and "implicitly political" mean?\n';
    // var impExpA = "A: Whatever these terms mean to you! We are just interested in 1. whether you think the TikTok is political, and 2. the extent to which you find it political.\n\n";
    // var whyQ = 'Q: What should I write for the explanation of my answer?\n';
    // var whyA = "A: If you think the video is explicitly or implicitly political, please put down the reason why you think so. If you think the video is neither, a quick explanation about why it isn't political or a description of the video content would be great.\n\n";
    // var finalThanks = "Thanks again for your participation and let's get started!"
    var reminders = "Reminders:\n\n";
    var payMsg = "- Please annotate 50 videos. You'll be paid $7.8.\n";
    var impExp = "- Rating videos: we're looking for your own subjective evaluation and a brief explanation of your choice.\n";
    var screenShot = "-Take a screenshot of the progress bar at the end of the study. Once it is filled, you are done (you do not need to submit the screenshot)."
    var moreInfo = "- See FAQ at the bottom right of this page for more info. Thanks!"
    alert(introMsg + reminders + payMsg + impExp + screenShot + moreInfo);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function observe(userId)
{
    let intersectOptions = {
        root: document.querySelector("#scrollArea"),
        rootMargin: "0px",
        threshold: 0.9, // maybe less
      };

    // Send data of video that is on screen
    const intersectCallback = (entries, observer) => {
        entries.forEach(async(entry) => {
            //console.log(entry);
            if(entry.isIntersecting)
            {
                if(entry.target.nextSibling != null && entry.target.localName !== 'svg'){
                    observer.unobserve(entry.target);

                    var timestamp = Date.now();

                    var caption = "";

                    var vidDescElem = entry.target.querySelector("[data-e2e='video-desc']");

                    var children = vidDescElem.children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if(child.nodeName === "A")
                        {
                            caption += child.children[0].innerText;
                        }else if(child.nodeName === "SPAN")
                        {
                            caption += child.innerText;
                        }
                    }

                    console.log("caption: " + caption);

                    var author = entry.target.querySelector("[data-e2e='video-author-uniqueid']").textContent;

                    await sleep(1000);
                    var vidTag = document.getElementsByTagName("video")[0];
                    var vidId = vidTag.parentElement.id.split('-')[2];

                    // var divplayer = entry.target.querySelector("[class*='DivVideoPlayerContainer']");
                    // console.log(divplayer);
                    // var vidTag = divplayer.getElementsByTagName("video")[0];
                    // var vidId = vidTag.parentElement.id.split('-')[2];
                    

                    var formatVideoSite = "https://www.tiktok.com/";
                    var videoSiteFinal = formatVideoSite.concat("@", author, "/video/", vidId);

                    const req = new XMLHttpRequest();
                    const baseUrl = "https://your-api-address-here";
                    const urlParams = `{\n \"is_user_answer\": false, \n \"user_id\": \"${userId}\",\n \"author\": \"${author}\",\n \"video_id\": \"${vidId}\",\n \"video_link\": \"${videoSiteFinal}\",\n \"submit_time\": ${timestamp},\n \"caption\": \"${caption}\" \n}`;   
                    console.log("urlparams: " + urlParams);
                    req.open("POST", baseUrl, true);
                    req.setRequestHeader("Access-Control-Allow-Origin", "*");
                    req.send(JSON.stringify({"body": `${urlParams}`}));

                    req.onreadystatechange = function() { // Call a function when the state changes.
                        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                            console.log("Got response 200!");
                        }
                    }
                }
            }
        });
    };
      
    let intersectTarget = document.querySelectorAll("[data-e2e='recommend-list-item-container']");
    let intersectObserver = new IntersectionObserver(intersectCallback, intersectOptions);
    for(let elem of intersectTarget)
    {
        intersectObserver.observe(elem);
    }

    const mutationTarget = document.querySelector("[class*='DivOneColumnContainer']");
    const mutationConfig = { attributes: false, childList: true, subtree: false };

    // Callback function for when new videos are added to the DOM
    const mutationCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            createSurvey(userId);
            if(mutation.addedNodes.length > 0)
            {
                intersectObserver.observe(mutation.addedNodes[0]);
            }
        }
    };

    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(mutationTarget, mutationConfig);
    
}

var submitCount = 0;
var totalCount = 50;
var progressB, progressL;

// Create the progress bar
function createProgressBar() {
    
    var headerDiv = document.querySelector("[class*='DivHeaderWrapperMain']").children[1];
    container = document.createElement("div");
    container.setAttribute("id", "progressBarContainer");
    container.style.width = "50vh";

    var logo = document.createElement('img');
    logo.src = chrome.runtime.getURL("images/icon-38.png");
    logo.style.display = "inline-block";
    logo.style.height = "4vh";
    logo.style.marginLeft = "30%";
    logo.style.verticalAlign = "middle";

    var progressBar = document.createElement("progress");
    progressBar.setAttribute("id", "progressBar");
    progressBar.setAttribute("value", "0");
    progressBar.setAttribute("max", "100");
    progressBar.style.display = "inline-block";
    progressBar.style.verticalAlign = "middle";
    progressBar.style.marginTop = "2%";
    progressBar.style.marginLeft = "10px";

    var progressLabel = document.createElement("span");
    progressLabel.setAttribute("id", "progressLabel");
    progressLabel.style.display = "inline-block";
    progressLabel.style.verticalAlign = "middle";
    progressLabel.style.marginLeft = "10px";
    progressLabel.style.marginTop = "8px";
    progressLabel.innerHTML = `${submitCount}/${totalCount}`
    
    container.appendChild(logo);
    container.appendChild(progressBar);
    container.appendChild(progressLabel);
    headerDiv.appendChild(container);

}

//function to test if the participant is logged in


function createSurvey(userId) {
    var elements = document.querySelectorAll("[data-e2e='recommend-list-item-container']");
    var vidCount = 0;

    for(let item of elements){
        var videoWrapper = item.childNodes[1].childNodes[1];
        if(videoWrapper.lastChild.className != "survey"){
            // Display the survey
            var survey = document.createElement('div');
            survey.className = "survey";
            survey.style.marginBottom = "40%";

            // Question 1:
            var q1 = document.createElement('p');
            q1.textContent = "Do you think this video is:";
            q1.style.fontWeight = "bold";

            let radioInputExp = document.createElement("input");
            radioInputExp.type = "radio";
            radioInputExp.id = "exp" + vidCount;
            radioInputExp.name = "policheck" + vidCount;
            radioInputExp.value = "Explicitly political";
            let radioLabelExp = document.createElement("label");
            radioLabelExp.innerText = " Explicitly political";
            radioLabelExp.for = "exp" + vidCount;

            let radioInputImp = document.createElement("input");
            radioInputImp.type = "radio";
            radioInputImp.id = "imp" + vidCount;
            radioInputImp.name = "policheck" + vidCount;
            radioInputImp.value = "Implicitly political";
            let radioLabelImp = document.createElement("label");
            radioLabelImp.innerText = " Implicitly political";
            radioLabelImp.for = "imp" + vidCount;

            let radioInputNeither = document.createElement("input");
            radioInputNeither.type = "radio";
            radioInputNeither.id = "nei" + vidCount;
            radioInputNeither.name = "policheck" + vidCount;
            radioInputNeither.value = "Neither";
            let radioLabelNeither = document.createElement("label");
            radioLabelNeither.innerText = " Neither";
            radioLabelNeither.for = "nei" + vidCount;

            // Question 2:
            var q2 = document.createElement('p');
            q2.textContent = "In a few words, please explain your choice:";
            q2.style.fontWeight = "bold";

            var whyTextArea = document.createElement('textarea');
            whyTextArea.name = "textarea";
            whyTextArea.id = "vidtext" + vidCount;
            whyTextArea.rows = "3";
            whyTextArea.cols = "25";
            whyTextArea.style.border = "2px solid black";

            // Create a submit button
            var submitButton = document.createElement('button');
            submitButton.id = "btn" + vidCount;
            submitButton.type = "submit";
            submitButton.textContent = "Submit";
            submitButton.style.cursor = 'pointer';
            submitButton.style.background='#D3D3D3';
            submitButton.style.borderRadius = '5px';

            submitButton.addEventListener('click', function(e) {
                handleSubmitClick(e, userId);
            });

            survey.appendChild(q1);
            survey.appendChild(radioInputExp);
            survey.appendChild(radioLabelExp);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(radioInputImp);
            survey.appendChild(radioLabelImp);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(radioInputNeither);
            survey.appendChild(radioLabelNeither);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(document.createElement('br'));
            survey.appendChild(q2);
            survey.appendChild(whyTextArea);
            survey.appendChild(document.createElement('br'));
            survey.appendChild(submitButton);
            videoWrapper.appendChild(survey);
        }
        vidCount += 1;
    }
}

function handleSubmitClick(e, userId)
{
    var vidIdNum = e.target.id.substring(3);

    // Get answer to "Which video category?"
    var radioIdString = "policheck" + vidIdNum;
    var radioQuery = "input[name='" + radioIdString + "']:checked";

    var radioCheckSelect = document.querySelector(radioQuery);
    var radioCheck = null;
    if(radioCheckSelect != null)
    {
        radioCheck = radioCheckSelect.value;
    }else
    {
        alert('Please fill out the survey before clicking submit!');
        return;
    }

    submitCount += 1;
    var timestamp = Date.now();
    // Change the submit button text and style
    var sButton = e.target;
    sButton.innerHTML = "&#10003; Done";
    sButton.style.color = "green";
    sButton.style.border = "none";
    sButton.disabled = true;

    if(submitCount <= totalCount){
        // Update progress bar value
        var progressBar = document.getElementById("progressBar");
        progressBar.value = (submitCount/totalCount) * 100;

        var progressLabel = document.getElementById("progressLabel");
        progressLabel.innerHTML = `${submitCount}/${totalCount}`;
    } else {
        var progressLabel = document.getElementById("progressLabel");
        progressLabel.innerHTML = `${totalCount}/${totalCount}`;
    }

    // Get text from "why?" textarea question
    var respString = "vidtext" + vidIdNum;
    var message = document.getElementById(respString).value;

    // Making assumption that the current video is playing when it's submit button is clicked
    var vidTag = document.getElementsByTagName("video")[0];
    var vidId = vidTag.parentElement.id.split('-')[2];

    var author = e.target.parentElement.parentElement.parentElement.parentElement
                .querySelector("[data-e2e='video-author-uniqueid']").textContent;

    var formatVideoSite = "https://www.tiktok.com/";
    var videoSiteFinal = formatVideoSite.concat("@", author, "/video/", vidId);

    const req = new XMLHttpRequest();
    const baseUrl = "https://your-api-address-here";
    const urlParams = `{\n \"is_user_answer\": true, \n \"user_id\": \"${userId}\",\n \"political\": \"${radioCheck}\",\n \"why\": \"${message}\",\n \"author\": \"${author}\",\n \"video_id\": \"${vidId}\",\n \"video_link\": \"${videoSiteFinal}\",\n \"submit_time\": ${timestamp}\n, \"session_vid_num\": ${parseInt(vidIdNum)}\n}`;    
    console.log("urlparams: " + urlParams);
    req.open("POST", baseUrl, true);
    req.setRequestHeader("Access-Control-Allow-Origin", "*");
    req.send(JSON.stringify({"body": `${urlParams}`}));

    req.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Got response 200!");
        }
    }
}

// Create the FAQ overlay
function createOverlay()
{
    var divBottom = document.querySelector('div[class*="DivBottomContainer"]');

    var logo = document.createElement('img');
    logo.src = chrome.runtime.getURL("images/icon-16.png");

    // Create outer box of overlay
    let instructionBox = document.createElement('div');
    instructionBox.style.width = '350px';
    instructionBox.style.height = '250px';
    instructionBox.style.color = 'black';
    instructionBox.style.background = 'white';
    instructionBox.style.padding = '20px';
    instructionBox.style.marginBottom = '5px';
    instructionBox.style.borderRadius = '25px';
    instructionBox.style.border = '2px solid black';
    instructionBox.style.overflow = 'auto';

    let close = document.createElement('button');
    close.textContent = 'x';
    close.style.float = 'right';
    close.style.outline = 'none';
    close.style.border = 'none';
    close.style.cursor = 'pointer';
    close.style.backgroundColor = 'transparent';

    close.addEventListener('click', function(e) {
        instructionBox.style.display = 'none';
    });

    let header = document.createElement('p');
    header.textContent = "FAQ:";
    header.style.fontWeight = "bold";
    header.style.fontSize = '25px';

    let q1 = document.createElement('p');
    q1.textContent = 'Q: What do the ratings "explicitly political" and "implicitly political" mean?';
    q1.style.fontWeight = "bold";
    
    let a1 = document.createElement('p');
    a1.textContent = 'A: Whatever these terms mean to you! We are just interested in 1. whether you think the TikTok is political, and 2. the extent to which you find it political.';
    
    let q2 = document.createElement('p');
    q2.textContent = 'Q: How much will I be paid for my participation in this study?';
    q2.style.fontWeight = "bold";

    let a2 = document.createElement('p');
    a2.textContent = 'A: You will be paid 17 cents per video response submitted. We will be expecting a minimum of 20 video responses and will be paying for a maximum of 40 video responses. This will total around $5-8, including payment for setting up the tool. We expect this study will take around 15-25 minutes. Please note that we will be verifying responses and will not pay for responses that clearly do not show any effort.'

    let q3 = document.createElement('p');
    q3.textContent = 'Q: What should I write for the explanation of my answer?';
    q3.style.fontWeight = "bold";

    let a3 = document.createElement('p');
    a3.textContent = 'A: If you think the video is explicitly or implicitly political, please put down the reason why you think so. If you think the video is neither, a quick explanation about why it is not political or a description of the video content would suffice.'
    
    let q4 = document.createElement('p');
    q3.textContent = 'Q: How do I ensure my ratings get recorded?';
    q3.style.fontWeight = "bold";

    let a4 = document.createElement('p');
    a3.textContent = 'A: Take a screenshot of the progress bar at the end of the study. Once it is filled, you are done (the extension updates in real time).'

    instructionBox.appendChild(close);
    instructionBox.appendChild(logo);
    instructionBox.appendChild(header);
    instructionBox.appendChild(q1);
    instructionBox.appendChild(a1);
    instructionBox.appendChild(q2);
    instructionBox.appendChild(a2);
    instructionBox.appendChild(q3);
    instructionBox.appendChild(a3);
    instructionBox.appendChild(q4);
    instructionBox.appendChild(a4);
    divBottom.insertBefore(instructionBox, divBottom.firstChild);
    
}