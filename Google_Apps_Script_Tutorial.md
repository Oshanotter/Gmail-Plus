# Google Apps Script Tutorial:
## Retrieving Your Contacts For Gmail Plus
Using your own Google Apps Script is important so that you only retrieve your contacts. Once you are finished with this tutorial, you will receive your Deployment URL, which you must paste into the popup on the Gmail page.

## Table of Contents
- [Step 1: Log In to Google Apps Script](#Log-In-to-Google-Apps-Script)
- [Step 2: Create A New Project](#Create-A-New-Project)
- [Step 3: Add The Peopleapi Service](#Add-The-Peopleapi-Service)
- [Step 4: Paste This Code](#Paste-This-Code)
- [Step 5: Deploy The Project](#Deploy-The-Project)
- [Step 6: Copy Your URL](#Copy-Your-URL)

## Log In to Google Apps Script
First, go to the [Google Apps Script](https://script.google.com/home/my) home page.  
Make sure you are logged in to the same Google account that you plan to use for Gmail Plus.

## Create A New Project
Next, click on "Create New Project" in the top left corner.  
You can name this project whatever you would like, but I call mine "Gmail Plus Contacts Helper".

## Add The Peopleapi Service
Next, on the lefthand side, click on the plus icon by "Services".  
Then, scroll through the list and find the "Peopleapi" service and choose it.  
Then click the "Add" button.

## Paste This Code
Then, replace the default function that Google made for you with the code below.
```javascript js
function doGet(e) {
  try {

    // Get the list of connections/contacts of user's profile
    var people = People.People.Connections.list('people/me', {
      personFields: 'names,emailAddresses,photos'
    });

    // create a dictionary
    var contactsDict = {};

    // Loop through each connection (contact) in the response
    people.connections.forEach(async connection => {
      var displayName = connection.names[0].displayName;
      var email = connection.emailAddresses[0].value;
      var photoURL = connection.photos[0].url;
      console.log("Name: " + displayName + "\nEmail: " + email + "\nPhoto: " + photoURL);

      // split the url to get the id
      var parts = photoURL.split("/");
      var lastPart = parts[parts.length - 1];
      var photoID = lastPart.split("=")[0];

      // get all of the email addresses in a list
      var emailsList = [];
      connection.emailAddresses.forEach(dict => {
        emailsList.push(dict.value)
      })

      // add the photoID as the key and the emailsList as the value to the contactsDict
      contactsDict[photoID] = emailsList;

    });

  } catch (err) {
    console.log('Failed to get connections:', err.message);
  }

  console.log(contactsDict);
  // return the contacts dictionary as a string
  return ContentService.createTextOutput(JSON.stringify(contactsDict)).setMimeType(ContentService.MimeType.JSON);

}
```

## Deploy The Project
Next, at the top of the screen, click on the "Deploy" button, then choose "New Deployment".  
Then, click on the cog wheel and choose "Web App" as the deployment type.  
You can type a description if you want, but make sure to leave "Execute as" set to "Me" and change "Who has access" to "Anyone". Don't worry, this doesn't mean that everyone can see your contacts.  
Then click the "Deploy" button.  
Next, click "Authorize Access", then choose your Google Account.  
Click on "Advanced" in the pop up window, then click on "Go to Gmail Plus Contacts Helper (unsafe)", or whatever you named your Google Apps Script.  
Then, click "Allow" one last time.

## Copy Your URL
Finally, copy the URL that shows up in the pop up window. It should look something like this: https://script.google.com/macros/s/AKycbyiShy6C3rZ2bfSXFvMu6X0nw4SQctyljgytwuz_wKR1Zi7mKNvIMgo/exec  
Then just paste it into the box on the Gmail page and you're done!   
Enjoy Gmail Plus!
