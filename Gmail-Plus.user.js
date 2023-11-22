// ==UserScript==
// @name Gmail Plus
// @description A userscript that adds user profile images to your inbox emails on Gmail. Additionally, it will send desltop notifications when a new email is received.
// @version 2.1.3
// @icon https://repository-images.githubusercontent.com/714702785/a02d79a1-227a-4179-9722-1c6f1610947e
// @updateURL https://raw.githubusercontent.com/Oshanotter/Gmail-Plus/main/Gmail-Plus.user.js
// @namespace Oshanotter
// @author Max Forst
// @include https://mail.google.com/mail*
// @include https://contacts.google.com/widget/companion*
// @run-at document-end
// ==/UserScript==

preferences = {
  // below is the url for the default profile image for users who do not have an image set
  "defaultImg" : "https://lh3.googleusercontent.com/a/default-user",

  // below is the url to the default sound that notifications will make when an email is received
  "defaultSound" : "https://ssl.gstatic.com/chat/sounds/hub_chat_notification_sunrise-973b53e821dc8ec76587980d63d7d6c1.mp3",

  // below is the option to send notifications or not. true means notifications will be sent and false means notifications will not be sent
  "sendNotifications" : true,

  // below is the option to play a sound (the default sound above) when a notification is sent. true means a sound will play and false means it will not
  "playSound" : true
}


function main(){
  // check to see if this code is running on the main page
  if (window === window.top){
    // add an event listener for a message from the embedded page
    window.addEventListener("message", receiveDictionary, false)
    // create the embedded page
    addEmbeddedPage()

    // find all of the emails in the inbox
    function findInbox(){
      // try to find the emails in the inbox
      try{
        table = document.querySelector('.F.cf.zt');
        eMails = table.querySelectorAll("tr")
        // tell the alreadyNotified list that all of the current emails have already sent a notification
        alreadyNotified = Array.from(eMails).map(element => element.id);
        // load the profile images from the cookies
        setProfileImages()
        // start observing for when new emails enter the inbox
        length = parseInt(document.querySelectorAll(".ts")[2].innerText)
        setInterval(scanForNewEmails, 1000)
        // add an event listener to see if the url changes, then try to set profile images again or get profile images from an email
        window.addEventListener('popstate', urlChange);
        // check for cookie to see if it has any value, if it doesn't, call the welcomeFunction()
        var dictionary = getCookie()
        if (dictionary ==  null || Object.keys(dictionary).length === 0){
          // if the cookie does not exist, send a prompt to open up the contacts sidebar
          // this will typically only appear for users the first time this script is used
          welcomeFunction()
        }
      }catch{
        //console.log("couldn't find emails in inbox, trying again...")
        setTimeout(findInbox, 1000)
      }
    }
    findInbox()

  }else{
    // call the code that is supposed to run on the embedded page
    embeddedPageFunction()
  }

}



function addEmbeddedPage(){
  // Create the iframe element
  var iframe = document.createElement('iframe');
  iframe.setAttribute('ng-non-bindable', '');
  iframe.frameBorder = 0;
  iframe.hspace = 0;
  iframe.marginHeight = 0;
  iframe.marginWidth = 0;
  iframe.scrolling = 'no';
  iframe.tabIndex = 0;
  iframe.vspace = 0;
  iframe.width = '100%';
  iframe.className = 'brC-brG-avO';
  iframe.sandbox = 'allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox';
  iframe.title = 'Contacts';
  iframe.id = 'I0_1699314454798';
  iframe.name = 'I0_1699314454798';
  iframe.src = 'https://contacts.google.com/widget/companion?origin=https%3A%2F%2Fmail.google.com&amp;hai=3&amp;hc=4%2C1%2C5%2C9&amp;hl=en&amp;forcehl=1&amp;usegapi=1&amp;id=I0_1699314454798&amp;_gfid=I0_1699314454798&amp;parent=https%3A%2F%2Fmail.google.com&amp;pfname=&amp;rpctoken=17068517&amp;jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.CzrNRWo3AFk.O%2Fd%3D1%2Frs%3DAHpOoo8xPbrtpW2bPUIcgU2adGqIEpV82Q%2Fm%3D__features__';

  // Append the iframe to the document or any specific element you want
  document.body.appendChild(iframe); // Or replace 'document.body' with your target element
  // change its position so it is not in the way
  iframe.style.position = "absolute"
}

function receiveDictionary(event){
  if (event.origin.includes("https://contacts.google.com") && event.data.includes("contactsDictionary=")){
    var dictAsString = event.data.replace("contactsDictionary=", '')
    var dict = JSON.parse(decodeURIComponent(dictAsString))
    //console.log("successfully received dictionary...")
    updateCookie(dict)
    setProfileImages()
  }
}

function setCookie(dict) {
  // sets the cookie to the dictionary passed as input
  // clear the current cookies first
  expireCookies()
  // convert the dictionary to a string to set it to a cookie
  var dictAsString = encodeURIComponent(JSON.stringify(dict));
  //console.log(dictAsString)
  var totalLength = dictAsString.length
  if (totalLength > 4000){
    var myIndex = 1
    // we need to split the string by every 4000 characters
    for (var i = 0; i < totalLength; i = i + 4000){
      var partString = dictAsString.substring(i, i + 4000)
      var cookieValue = "ProfileImagesDictionary" + myIndex + "=" + partString
      var myIndex = myIndex + 1
      //console.log("cookie value for index: " + i)
      //console.log(cookieValue)
      document.cookie = cookieValue
    }
  }else{
    document.cookie = "ProfileImagesDictionary1=" + dictAsString
  }
  //console.log("successfully set cookie...")
  //console.log(dict)
}

function getCookie() {
  // returns the dictionary stored in the cookie if it exists
  var list = []
  var cookieArray = document.cookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      if (cookie.includes("ProfileImagesDictionary")) {
        //console.log(cookie)
        list.push(cookie)
      }
  }
  if (list.length == 0){
    return null;
  }else{
    // sort the list
    list.sort();
    // convert the list into a string
    var listAsString = list.join("");
    var returnString = listAsString.replace(/ProfileImagesDictionary\d+=/g, "")
    var returnString = returnString.replace(/\s/g, "");
    //console.log(returnString)
    var returnValue = JSON.parse(decodeURIComponent(returnString));
    return returnValue
  }
}

function setProfileImages(){
  var dict = getCookie()
  var currentElement = document.querySelector('.bGI.nH.oy8Mbf.S4:not([style*="display: none"])');
  var table = currentElement.querySelector('.F.cf.zt');
  var eMails = table.querySelectorAll("tr")
  // load the images from the cookie
  for (var i = eMails.length - 1; i >= 0; i--){
    //console.log(i)
    var mail = eMails[i]
    //console.log(mail)
    var sender = mail.querySelector('.bA4').firstElementChild
    var address = sender.getAttribute('email')
    //console.log(address)
    if (dict == null){
      var link = preferences["defaultImg"] //"https://i.imgur.com/LeHM0zA.png"
    }else{
      var link = dict[address]
      if (link == undefined){
        var link = preferences["defaultImg"] //"https://i.imgur.com/LeHM0zA.png"
      }
    }
    //console.log(link)

    var profileImageElement = document.createElement("img");
    profileImageElement.src = link
    profileImageElement.alt = "profile image";
    profileImageElement.width = 25;
    profileImageElement.height = 25;
    profileImageElement.style.borderRadius = "50%"
    if (mail.firstChild.tagName == "IMG"){
      mail.firstChild.src = link
    }else{
      mail.insertBefore(profileImageElement, mail.firstChild);
    }
    // add the listener for if the image is removed
    detectRemovalListener(mail)
  }
}

function updateCookie(dict){
  var currentCookie = getCookie()
  //console.log("current dict: ")
  //console.log(currentCookie)
  //console.log("new dict: ")
  //console.log(dict)
  var mergedDict = { ...currentCookie, ...dict }
  //console.log("merged dict: ")
  //console.log(mergedDict)
  setCookie(mergedDict)
}

function expireCookies(){
  // loop through all cookies to find the ones to expire
  var cookieArray = document.cookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      if (cookie.includes("ProfileImagesDictionary")) {
        // add the expiration date to the cookie and set set the cookie again
        var str = cookie + "; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = str
      }
  }
}

function detectRemovalListener(email){
  // this will detect when a when the image is removed from the email
  const elementToRemove = email.querySelector("img")

  // Target element from which you want to detect removal
  const targetElement = email

  // Create a new MutationObserver
  const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
              // Check if the removed nodes include the specific element you're interested in
              if (Array.from(mutation.removedNodes).includes(elementToRemove)) {
                  // The element has been removed from the parent element
                  //console.log("profile image removed, replacing it...");
                  setProfileImages()
              }
          }
      }
  });

  // Configure the observer to watch for changes in child nodes
  const config = { childList: true };

  // Start observing
  observer.observe(targetElement, config);

}

function scanForNewEmails(){
  var table = document.querySelector('.F.cf.zt');
  var eMails = table.querySelectorAll("tr")
  var newLength = parseInt(document.querySelectorAll(".ts")[2].innerText)

  if (newLength > length){
    //console.log("new email...")
    var newMail = eMails[0]
    var title = getTextAndEmojis(newMail.querySelector('.bog').firstChild)
    //console.log("title: " + title)
    var body = getTextAndEmojis(newMail.querySelector('.y2'))
    //console.log("body: " + body)
    var sender = newMail.querySelector('.bA4').firstElementChild
    var name = getTextAndEmojis(sender)
    //console.log("name: " + name)
    var address = sender.getAttribute('email')
    //console.log("address: " + address)
    if (!alreadyNotified.includes(newMail.id) && newMail.className.includes("zE")){
      // if a notification has not already been sent from this email AND the email is unread...
      // send a notification with the new email's data
      sendNotification(title, body, name, address)
      // add the id to the alreadyNotified list
      alreadyNotified.push(newMail.id)
    }
    // put the profile images back on the emails because they were removed when the new email was received
    setProfileImages()
  }else{
    //console.log("no new emails...")
  }
  length = newLength
}

function sendNotification(title, body, name, address){
  // takes the title and body of the email as well as the sender's name and email address as input and sends a notification to the desktop
  if (preferences["sendNotifications"] == false){
    // don't send the notification
    return
  }
  //console.log("sending notification...")
  var updatedBody = body.replace(" - ", "")

  var dict = getCookie()
  if (dict == null){
    var image = preferences["defaultImg"] //"https://i.imgur.com/LeHM0zA.png"
  }else{
    var image = dict[address]
    if (image == undefined){
      var image = preferences["defaultImg"] //"https://i.imgur.com/LeHM0zA.png"
    }
  }
  var options = {
          body: title + "\n" + updatedBody,
          icon: image
        };

  // send the notification
  var notification = new Notification(name, options);
  notification.addEventListener('click', function () {
    // Open the url to the email page. (Can't do this at this moment, cannot find the url of individual emails)
    //window.open('https://example.com', '_blank');
    // Instead, focus on the window where the notification came from, and click on the email to open it
    window.focus()
    notification.close();  // Close the notification after opening the URL
    //console.log("clicked on notification...")
    setProfileImages();
    // find a way to click on the email
    clickOnEmail(title, updatedBody, name, address)
  });

  if (preferences["playSound"] == true){
    var sound = new Audio(preferences["defaultSound"])
    // play the notification sound when a new email is detected
    sound.play()
  }
}

function getTextAndEmojis(element) {
    var result = '';
    // Iterate through child nodes
    element.childNodes.forEach(function (node) {
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

function clickOnEmail(title, body, name, address){
  // finds the specific email and clicks on it
  var table = document.querySelector('.F.cf.zt');
  var eMails = table.querySelectorAll("tr")
  for (var i = 0; i < eMails.length; i++){
    var email = eMails[i]
    var rTitle = getTextAndEmojis(email.querySelector('.bog').firstChild)
    var rBody = getTextAndEmojis(email.querySelector('.y2'))
    var sender = email.querySelector('.bA4').firstElementChild
    var rName = getTextAndEmojis(sender)
    var rAddress = sender.getAttribute('email')
    var isTitle = rTitle == title
    var isBody = rBody.includes(body)
    var isName = rName == name
    var isAddress = rAddress == address
    // if the email contains the correct title, body, name, and address, click on it and exit the function
    if (isTitle && isBody && isName && isAddress){
      email.click()
      return
    }
  }
}

function urlChange(){
  // this function will be run every time the url of the page changes
  //console.log("url of the page changed...")
  var url = window.location.href
  if (url.includes("#inbox/")){
    //console.log("get the image from the sender of the email...")
    getImgFromEmail(0)
  }else if (!url.includes("#inbox")){
    //console.log("add profile images to the emails...")
    var currentElement = document.querySelector('.bGI.nH.oy8Mbf.S4:not([style*="display: none"])');
    var table = currentElement.querySelector('.F.cf.zt');
    var eMails = table.querySelectorAll("tr")
    setProfileImages()
  }
}

function getImgFromEmail(num){
  // this function will obtain the profile image from individual emails
  if (num == 5){
    return
  }
  try{
    var img = document.querySelector('.aCi').children[1]
    var src = img.src
    var url = src.split('=')[0]
    if (url.includes("ssl.gstatic")){
      setTimeout(function() {
        getImgFromEmail(num + 1);
      }, 1000);
      return
    }else if (url.includes("https://lh3.googleusercontent.com/a/default-user")){
      return
    }
    var address = document.querySelector('.iw').firstChild.firstChild.dataset.hovercardId
    var dict = {}
    dict[address] = url
    updateCookie(dict)
  }catch{
    setTimeout(function() {
      getImgFromEmail(num + 1);
    }, 1000);
  }
}

function welcomeFunction() {
  // Create a container div for the popup
  const popupContainer = document.createElement('div');
  popupContainer.style.position = 'fixed';
  popupContainer.style.top = '50%';
  popupContainer.style.left = '50%';
  popupContainer.style.transform = 'translate(-50%, -50%)';
  popupContainer.style.backgroundColor = '#fff';
  popupContainer.style.padding = '20px';
  popupContainer.style.border = '2px solid #ccc';
  popupContainer.style.borderRadius = '8px';
  popupContainer.style.zIndex = '9999';

  // Create a paragraph for the message
  const messageParagraph = document.createElement('p');
  messageParagraph.textContent = "Welcome to Gmail Plus!\n\nYou are probably seeing generic profile images for your contacts right now. Don't worry! Clicking on the 'Contacts' button on the side panel to the right should fix this. \n\nAfter clicking on it, it will go through your contacts to get their profile images. You only have to do this once; every other time you come to this page, you will not have to open this side panel. In addition, your contact photos will update automatically as you add more or change old ones. \n\nThanks for using my Userscript!";
  messageParagraph.style.whiteSpace = 'pre-line';
  popupContainer.appendChild(messageParagraph);

  // Create a "Got It!" button
  const gotItButton = document.createElement('button');
  gotItButton.textContent = 'Got It!';
  gotItButton.style.marginTop = '15px';
  gotItButton.style.padding = '8px 16px';
  gotItButton.style.backgroundColor = '#008bff';
  gotItButton.style.color = '#fff';
  gotItButton.style.border = 'none';
  gotItButton.style.borderRadius = '4px';
  gotItButton.style.cursor = 'pointer';
  gotItButton.addEventListener('click', () => {
    // Close the popup when the button is clicked
    document.body.removeChild(popupContainer);
  });
  popupContainer.appendChild(gotItButton);

  // Append the popup container to the body
  document.body.appendChild(popupContainer);
}



function embeddedPageFunction(){
  var embeddedPageUrl = window.location.href
  // check to see if the embedded page is the correct one: "contacts.google.com"
  if (embeddedPageUrl.includes('https://contacts.google.com/widget/companion')){
    // initialize the dictionary that will be sent to the main page
    var dictionary = {}
    //console.log("initiating the embedded page functiion...")

    // find all of the contacts and loop through them to find all of their emails and their profile image
    function findAllContacts(index){
      // the index parameter is at which index you want to start at. zero should always be used to loop through all contacts
      allContacts = document.getElementsByClassName("XXcuqd");
        if (allContacts.length == 0){
          // continue checking for contacts until they appear when the page is fully loaded
          var interval = setInterval(function(){
            //console.log("looking for contacts")
            allContacts = document.getElementsByClassName("XXcuqd");
            if (allContacts.length > 0){
              clearInterval(interval)
              // find the contact photo of the contact at index
              if (index >= allContacts.length){
                // all of the contacts have been looped through, end the function by sending the dictionary to the main page
                sendDictionary()
                return
              }
              profileImageUrl = allContacts[index].getElementsByTagName("img")[0].src
              // now loop through the contacts
              //console.log("found all contacts: ")
              //console.log(allContacts)
              loopThroughContacts(index)
            }
          }, 1000);
        }
    }

    async function loopThroughContacts(index){
      // this clicks on the contact at the specified index, then calls the findAllEmails() function and waits for it to finish before continuing
      //console.log(index)
      //console.log(allContacts.length)
      if (index < allContacts.length){
        // click on each contact to open a new page and recieve all of the emails
        allContacts[index].firstChild.childNodes[1].firstChild.click()
        //console.log("clicked on the contact")
        // wait for findAllEmails() to complete before moving on
        await findAllEmails()
        // find all of the contacts again because they were removed when clicking on one of the contacts
        findAllContacts(index + 1)
      }
    }

    function findAllEmails(){
      // finds all of the emails on the current page
      // sends a resolve to the function that called it so that it doesn't continue without the necessary information
      return new Promise((resolve) => {
        allEmails = document.getElementsByClassName("urwqv");
        if (allEmails.length == 0){
          // continue checking for emails until they appear when the page is fully loaded
          var interval = setInterval(function(){
            allEmails = document.getElementsByClassName("urwqv");
            if (allEmails.length > 0){
              clearInterval(interval)
              //console.log(allEmails)
              // get all of the emails' inner text
              for (var i = 0; i < allEmails.length; i++){
                  var email = allEmails[i].innerText.split("\n")[0]
                  //console.log(email)
                  if (email != "Add birthday" && email != "Add phone number"){
                    // add the email to the dictionary with the profile image url
                    dictionary[email] = profileImageUrl.split("=")[0] // .split("=")[0] makes the url point to a full resolution image
                  }
                }
              //console.log(dictionary)
              // go back to the main page
              document.querySelector('button[aria-label="Back"]').click()
              resolve();
            }
          }, 1000);
        }else{
          // there are no emails, resolve now
          resolve();
        }
      });
    }

    function sendDictionary(){
      // this is what happens when there are no more contacts to loop through
      //console.log("there are no more contacts")
      // convert the dictionay to a string
      var dictAsString = encodeURIComponent(JSON.stringify(dictionary))
      // send a message with the dictionary to the main webpage
      window.parent.postMessage("contactsDictionary=" + dictAsString, 'https://mail.google.com/mail/u/0/#inbox');
      //console.log("sent message to main page...")
    }


    findAllContacts(0)
  }
}


main()
