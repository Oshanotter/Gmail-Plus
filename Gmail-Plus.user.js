// ==UserScript==
// @name Gmail Plus
// @description A userscript that adds user profile images to your inbox emails on Gmail. Additionally, it will send desktop notifications when a new email is received.
// @version 3.0.0
// @icon https://repository-images.githubusercontent.com/714702785/a02d79a1-227a-4179-9722-1c6f1610947e
// @updateURL https://raw.githubusercontent.com/Oshanotter/Gmail-Plus/main/Gmail-Plus.user.js
// @namespace Oshanotter
// @author Max Forst
// @include https://mail.google.com/mail*
// @run-at document-end
// ==/UserScript==

preferences = {
  // below is the url for the default profile image for users who do not have an image set
  "defaultImg": "https://lh3.googleusercontent.com/a/default-user",

  // below is the url to the default sound that notifications will make when an email is received
  "defaultSound": "https://ssl.gstatic.com/chat/sounds/hub_chat_notification_sunrise-973b53e821dc8ec76587980d63d7d6c1.mp3",

  // below is the option to send notifications or not. true means notifications will be sent and false means notifications will not be sent
  "sendNotifications": true,

  // below is the option to play a sound (the default sound above) when a notification is sent. true means a sound will play and false means it will not
  "playSound": true
};


function main() {

  // welcome the user if it is their first time using the userscript
  welcomeFunction();

  // find all of the emails in the inbox
  findInbox();

  // update the contacts using the Google Apps Script
  getContactsFromAppsScript();

}

function welcomeFunction() {
  // first, check to see if the local storage email dict exists
  var dict = localStorage.getItem("DeploymentURL");
  if (dict != null) {
    return;
  }

  // Create a new div element
  var div = document.createElement("div");

  // Set the style attribute for the div
  div.style.position = "fixed";
  div.style.top = "50%";
  div.style.left = "50%";
  div.style.transform = "translate(-50%, -50%)";
  div.style.backgroundColor = "rgb(255, 255, 255)";
  div.style.padding = "20px";
  div.style.border = "2px solid rgb(204, 204, 204)";
  div.style.borderRadius = "8px";
  div.style.zIndex = "9999";

  // Create the first paragraph element
  var paragraph1 = document.createElement("b");
  paragraph1.style.whiteSpace = "pre-line";
  paragraph1.textContent = "Welcome to Gmail Plus!";
  div.appendChild(paragraph1);

  // Create the second paragraph element
  var paragraph2 = document.createElement("p");
  paragraph2.textContent = "You are probably seeing generic profile images for your contacts right now. Don't worry! You simply must create a Google Apps Script.";
  div.appendChild(paragraph2);

  // Create the third paragraph element
  var paragraph3 = document.createElement("p");
  var link = document.createElement("a");
  link.href = "https://github.com/Oshanotter/Gmail-Plus/blob/main/Google_Apps_Script_Tutorial.md";
  link.target = "_blank";
  link.textContent = "Here";
  paragraph3.appendChild(document.createTextNode(" "));
  paragraph3.appendChild(link);
  paragraph3.appendChild(document.createTextNode(" is a guide on how to create you Google Apps Script. After you have your deployment URL, paste it in the box below then click the 'Start' button."));
  div.appendChild(paragraph3);

  // Create the input element
  var input = document.createElement("input");
  input.type = "text";
  input.id = "deploymentURL";
  input.name = "deploymentURL";
  input.placeholder = "Deployment URL";
  input.style.width = "100%";
  div.appendChild(input);

  // Create the fourth paragraph element
  var paragraph4 = document.createElement("p");
  paragraph4.textContent = "Thanks for using my Userscript!";
  div.appendChild(paragraph4);

  // Create the button element
  var button = document.createElement("button");
  button.textContent = "Start";
  button.style.marginTop = "15px";
  button.style.padding = "8px 16px";
  button.style.backgroundColor = "rgb(0, 139, 255)";
  button.style.color = "rgb(255, 255, 255)";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  button.addEventListener("click", function() {
    var deploymentURL = input.value.trim();
    if (deploymentURL == "" || !deploymentURL.includes("https://script.google.com/macros/s/") || !deploymentURL.includes("/exec")) {
      alert("Error: \n\nInvalid Deployment URL!");
    } else {
      localStorage.setItem("DeploymentURL", deploymentURL);
      getContactsFromAppsScript();
      div.remove();
    }
  });
  div.appendChild(button);

  // Append the div to the body of the document
  document.body.appendChild(div);

}

function findInbox() {
  // try to find the emails in the inbox
  try {
    table = document.querySelector('.F.cf.zt');
    eMails = table.querySelectorAll("tr");
    // tell the alreadyNotified list that all of the current emails have already sent a notification
    alreadyNotified = Array.from(eMails).map(element => element.id);
    // load the profile images from the local storage
    setProfileImages();
    // start observing for when new emails enter the inbox
    length = parseInt(document.querySelectorAll(".ts")[2].innerText);
    setInterval(scanForNewEmails, 1000);
    // add an event listener to see if the url changes, then try to set profile images again or get profile images from an email
    window.addEventListener('popstate', urlChange);
  } catch {
    //console.log("couldn't find emails in inbox, trying again...");
    setTimeout(findInbox, 1000);
  }
}

function getContactsFromAppsScript() {
  // get the contacts dict from the Google Apps Script
  var appsScriptURL = localStorage.getItem("DeploymentURL");
  if (appsScriptURL == null) {
    return;
  }

  fetch(appsScriptURL)
    .then((response) => {
      //console.log(response.status);
      return response.json();
    })
    .then((response) => {
      var string = JSON.stringify(response);
      localStorage.setItem("ContactsDict", string);
      setProfileImages();
    });

}

function setProfileImages() {
  var dict = JSON.parse(localStorage.getItem("ContactsDict"));
  //console.log(dict);
  var currentElement = document.querySelector('.bGI.nH.oy8Mbf.S4:not([style*="display: none"])');
  var table = currentElement.querySelector('.F.cf.zt');
  var eMails = table.querySelectorAll("tr");
  // load the images from the local storage
  for (var i = eMails.length - 1; i >= 0; i--) {
    //console.log(i);
    var mail = eMails[i];
    //console.log(mail);
    var sender = mail.querySelector('.bA4').firstElementChild;
    var address = sender.getAttribute('email');
    //console.log(address);
    var link = getImageURL(dict, address);
    //console.log(link);

    var profileImageElement = document.createElement("img");
    profileImageElement.src = link;
    profileImageElement.alt = "profile image";
    profileImageElement.width = 25;
    profileImageElement.height = 25;
    profileImageElement.style.borderRadius = "50%";
    if (mail.firstChild.tagName == "IMG") {
      mail.firstChild.src = link;
    } else {
      mail.insertBefore(profileImageElement, mail.firstChild);
    }
    // add the listener for if the image is removed
    detectRemovalListener(mail);
  }
}


function detectRemovalListener(email) {
  // this will detect when a when the image is removed from the email
  const elementToRemove = email.querySelector("img");

  // Target element from which you want to detect removal
  const targetElement = email;

  // Create a new MutationObserver
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        // Check if the removed nodes include the specific element you're interested in
        if (Array.from(mutation.removedNodes).includes(elementToRemove)) {
          // The element has been removed from the parent element
          //console.log("profile image removed, replacing it...");
          setProfileImages();
        }
      }
    }
  });

  // Configure the observer to watch for changes in child nodes
  const config = {
    childList: true
  };

  // Start observing
  observer.observe(targetElement, config);

}

function getImageURL(dict, address) {
  // gets the image url of the specified address from the dictionary
  if (dict == null) {
    var link = preferences["defaultImg"]; //"https://i.imgur.com/LeHM0zA.png"
  } else {
    // loop through the dictionary to find the correct key for the given value
    for (let key in dict) {
      if (dict[key].includes(address)) {
        var imgID = key;
        break;
      }
    }
    if (imgID == null) {
      var link = preferences["defaultImg"]; //"https://i.imgur.com/LeHM0zA.png"
    } else {
      var link = "https://lh3.googleusercontent.com/contacts/" + imgID;
    }
  }
  return link;
}

function scanForNewEmails() {
  var table = document.querySelector('.F.cf.zt');
  var eMails = table.querySelectorAll("tr");
  var newLength = parseInt(document.querySelectorAll(".ts")[2].innerText);

  if (newLength > length) {
    //console.log("new email...");
    var newMail = eMails[0];
    var title = getTextAndEmojis(newMail.querySelector('.bog').firstChild);
    //console.log("title: " + title);
    var body = getTextAndEmojis(newMail.querySelector('.y2'));
    //console.log("body: " + body);
    var sender = newMail.querySelector('.bA4').firstElementChild;
    var name = getTextAndEmojis(sender);
    //console.log("name: " + name);
    var address = sender.getAttribute('email');
    //console.log("address: " + address);
    if (!alreadyNotified.includes(newMail.id) && newMail.className.includes("zE")) {
      // if a notification has not already been sent from this email AND the email is unread...
      // send a notification with the new email's data
      sendNotification(title, body, name, address);
      // add the id to the alreadyNotified list
      alreadyNotified.push(newMail.id);
    }
    // put the profile images back on the emails because they were removed when the new email was received
    setProfileImages();
  } else {
    //console.log("no new emails...");
  }
  length = newLength;
}

function urlChange() {
  // this function will be run every time the url of the page changes
  //console.log("url of the page changed...");
  if (!url.includes("#inbox")) {
    //console.log("add profile images to the emails...");
    var currentElement = document.querySelector('.bGI.nH.oy8Mbf.S4:not([style*="display: none"])');
    var table = currentElement.querySelector('.F.cf.zt');
    var eMails = table.querySelectorAll("tr");
    setProfileImages();
  }
}

function sendNotification(title, body, name, address) {
  // takes the title and body of the email as well as the sender's name and email address as input and sends a notification to the desktop
  if (preferences["sendNotifications"] == false) {
    // don't send the notification
    return;
  }
  //console.log("sending notification...");
  var updatedBody = body.replace(" - ", "");

  var dict = JSON.parse(localStorage.getItem("ContactsDict"));
  var image = getImageURL(dict, address);
  var options = {
    body: title + "\n" + updatedBody,
    icon: image
  };

  // send the notification
  var notification = new Notification(name, options);
  notification.addEventListener('click', function() {
    // Open the url to the email page. (Can't do this at this moment, cannot find the url of individual emails)
    //window.open('https://example.com', '_blank');
    // Instead, focus on the window where the notification came from, and click on the email to open it
    window.focus();
    notification.close(); // Close the notification after opening the URL
    //console.log("clicked on notification...");
    setProfileImages();
    // find a way to click on the email
    clickOnEmail(title, updatedBody, name, address);
  });

  if (preferences["playSound"] == true) {
    var sound = new Audio(preferences["defaultSound"]);
    // play the notification sound when a new email is detected
    sound.play();
  }
}

function getTextAndEmojis(element) {
  var result = '';
  // Iterate through child nodes
  element.childNodes.forEach(function(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Text node (including text content and emojis)
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
      // Image node (emoji)
      var emojiAlt = node.alt;
      result += emojiAlt;
    }
  });
  return result;
}

function clickOnEmail(title, body, name, address) {
  // finds the specific email and clicks on it
  var table = document.querySelector('.F.cf.zt');
  var eMails = table.querySelectorAll("tr");
  for (var i = 0; i < eMails.length; i++) {
    var email = eMails[i];
    var rTitle = getTextAndEmojis(email.querySelector('.bog').firstChild);
    var rBody = getTextAndEmojis(email.querySelector('.y2'));
    var sender = email.querySelector('.bA4').firstElementChild;
    var rName = getTextAndEmojis(sender);
    var rAddress = sender.getAttribute('email');
    var isTitle = rTitle == title;
    var isBody = rBody.includes(body);
    var isName = rName == name;
    var isAddress = rAddress == address;
    // if the email contains the correct title, body, name, and address, click on it and exit the function
    if (isTitle && isBody && isName && isAddress) {
      email.click();
      return;
    }
  }
}


main();