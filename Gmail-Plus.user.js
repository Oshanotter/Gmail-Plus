// ==UserScript==
// @name Gmail Plus
// @description A userscript that adds user profile images to your inbox emails on Gmail.
// @version 1.0.0
// @icon https://repository-images.githubusercontent.com/714702785/a02d79a1-227a-4179-9722-1c6f1610947e
// @updateURL https://raw.githubusercontent.com/Oshanotter/Gmail-Plus/main/Gmail-Plus.user.js
// @namespace Oshanotter
// @author Max Forst
// @include https://mail.google.com/mail*
// @include https://contacts.google.com/widget/hovercard/v/2*
// @run-at document-end
// ==/UserScript==

function main(){
  // check to see if this code is running on the main page
  if (window === window.top){
    // count how many emails there are, set it to indexEmailsNoImg as a zero based index
    table = document.querySelector('.F.cf.zt');
    eMails = table.querySelectorAll("tr")
    indexEmailsNoImg = eMails.length - 1

    // create profile images next to each email
    nextProfileImage()

    // create an event listener to capture the image urls from the embedded page. It will create the profile images
    window.addEventListener("message", setImage, false)

    // initialize a function that will repeat every second
    /*
    setInterval(function() {
      // check for new mail then send notification and update profile images
      var gotMail = checkNewMail()
      if (gotMail == true){
        updateProfileImages()
      }
    }, 1000);
    */
  }else{
    // run the function for the embedded page
    embeddedPageFunction()
  }
}


function nextProfileImage(){
  // stop the function if there are no more emails left to add images to
  if (indexEmailsNoImg < 0){
    return
  }

  // get the email at index indexEmailsNoImg
  var theEmail = eMails[indexEmailsNoImg]
  var title = theEmail.querySelector('.bog').innerText
  var body = theEmail.querySelector('.y2').innerText
  var sender = theEmail.querySelector('.bA4').firstElementChild
  var name = sender.innerText
  var address = sender.getAttribute('email')

  // start creating the iframe with the last email's credintals
  addHoverCard(address)

  // then make a call to the embedded page after you find out what its url is
  var iframes = document.querySelectorAll("iframe");

  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var iframeUrl = iframe.src;
    if (iframeUrl.includes("contacts.google.com")) {
      // Send the message to the found iframe
      iframe.contentWindow.postMessage("receiveImage", iframeUrl);
    }
  }

}


function setImage(event){
  // the event listener will check to see if the message is valid
  if (event.origin.includes("https://contacts.google.com") && event.data.includes("profileImgURL: ")){
    // get the url from the embeded page
    var url = event.data.replace(/profileImgURL: /, '')

    // create the image in the correct place
    var profileImageElement = document.createElement("img");
    profileImageElement.src = url
    profileImageElement.alt = "profile image";
    profileImageElement.width = 25;
    profileImageElement.height = 25;
    profileImageElement.style.borderRadius = "50%"
    var currentEmail = eMails[indexEmailsNoImg]
    currentEmail.insertBefore(profileImageElement, currentEmail.firstChild);

    // remove the iframe
    spanElement.remove()

    // move the index to the next email
    indexEmailsNoImg -= 1

    // call nextProfileImage() again
    nextProfileImage()
  }
}


function addHoverCard(address){
  // Create a <span> element
  spanElement = document.createElement('span');

  // Set the attributes for the <span> element
  spanElement.setAttribute('translate', 'no');
  spanElement.setAttribute('class', 'yP');
  spanElement.setAttribute('email', 'the_senders_email');
  spanElement.setAttribute('name', 'the_senders_name');
  spanElement.setAttribute('data-hovercard-id', address);
  spanElement.setAttribute('data-hovercard-owner-id', '113');

  // Set the inner text for the <span> element
  spanElement.innerText = 'the_senders_name';

  // Append the <span> element to the document body or any other desired location
  document.body.appendChild(spanElement);



  spanElement.addEventListener('mouseover', function() {
    // uncomment to debug
    //console.log('Event triggered');
  });

  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });

  spanElement.dispatchEvent(event);

  // make the div invisible
  document.querySelector("#__HC_94253229 > iframe").style.display = "none"
}



function embeddedPageFunction(){
  var embeddedPageUrl = window.location.href
  // check to see if the embedded page is the correct one: "contacts.google.com"
  if (embeddedPageUrl.includes('contacts.google.com')){
    // add event listener to listen for a request for a profile image
    window.addEventListener("message", function(event){
      // the event listener will check to see if the message is valid
      if (event.origin.includes("https://mail.google.com") && event.data === "receiveImage"){
        // the message is valid, so start finding the images and send the urls back to the main page
        //console.log("soure is accepted")
        function getProfileImg(){
          try{
            var imageTags = document.getElementsByTagName('img');
            // check for the image every 10 miliseconds
            var myInterval = setInterval(function(){
              if (imageTags.length > 0){
                clearInterval(myInterval);
                //console.log('Image source:', imageTags[0].src);
                window.parent.postMessage("profileImgURL: " + imageTags[0].src, 'https://mail.google.com/mail/u/0/#inbox');
              }
            }, 10);
          }catch{
            // something went wrong, so just try it again
            console.log("error with finding image, trying again...")
            getProfileImg()
          }
        }
        getProfileImg()
      }
    }, false);
  }
}


function retry(){
  try{
    main()
  }catch{
    setTimeout(() => {
          console.log("error with main() function, retrying...")
          retry()
    }, 1000);
  }
}

retry()
