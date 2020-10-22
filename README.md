# firestore error when uploading large rules file

This project contains a simple firebase project which only has firestore
configured. The rules file that is contained in this project has been verified
by Firebase support to not contain any bugs or issues as well as tested with
firebase emulator which outputs no errors or warnings when loading the rules. It is simply a larger set
of rules from an open source firebase application framework I've been working on
[moltres](https://github.com/brianneisler/moltres). When attempting to deploy
this project to firebase, a 400 error from firebase is returned.
```
HTTP Error: 400, Request contains an invalid argument.
```
When attempting to manually copy and paste the rules to the rules editor and
then save the rules an error occurs.
```
Error saving rules - an unknown error occurred
```

I ran through a test where I commented out all of the code and then slowly
uncommented portions of it based on dependency (looking for a problematic line).
However, what I noticed is that as I uncommented more and more code the problem
started happening more frequently. At first it would fail 1 in 5 times.
Uncomment more code, at it started failing more frequently. The rules contained
in this project are at the threshold where they contain enough code that it does
not publish most of the time. I was able to get them to publish once but only
after clicking the publish button 20 or so times. This leads me to believe that
there is some kind of race condition based on compilation time on Firebase's
side since the size of the file remained the same, only the code that was
uncommented changed.

I submitted this issue to Firebase support and they were unable to help me.
Their only suggestion was to try uploading the rules in chunks (pasting half of
it first, saving, and then pasting the other half.) This didn't seem to change anything.

I also submitted this issue to StackOverflow and received no helpful responses https://stackoverflow.com/questions/63925021/firestore-uploading-larger-rules-file-results-in-error-400-request-contains-a?noredirect=1#comment113059218_63925021

## Current workaround
If i minimize the rules using the
[firemin](https://github.com/brianneisler/firemin) rules minifier, the
deployment succeeds more often. This makes sense since it collapses single use
functions and overal reduces the size of the rules file. You can test this by
trying to upload the [`firestore.min.rules`](./firestore.min.rules) file contained in this project


## Reproduction Setup
- create a new project on firebase.google.com using the "add new project"
- go to firestore tab and click "Create database"
- select "start in production mode" and click "Next"
- select nam-5 (us-central) and click "Enable"

### Reproduction on firebase console
- click "rules" tab
- copy rules from the example repo https://github.com/brianneisler/firestore-large-rules-file/blob/main/firestore.rules and paste into editor
- click "publish" button
- will likely come back with "Error saving rules - an unknown error occurred"
- note here that if i clicked "publish" enough times occasionally it will save. 

### Reproduction locally from example repo
- checkout the example repo https://github.com/brianneisler/firestore-large-rules-file
- on command line, install project dependencies `npm i`
- replace the project name in [`.firebaserc`](./.firebaserc#L3) with the project name you used during setup
- publish rules only "./node_modules/.bin/firebase deploy --only firestore:rules --debug"
- An error should be returned and rules will fail to deploy. Error will look
  like this...
```
Error: HTTP Error: 400, Request contains an invalid argument.
[2020-09-13T19:29:41.552Z] Error Context: {
  "body": {
    "error": {
      "code": 400,
      "message": "Request contains an invalid argument.",
      "status": "INVALID_ARGUMENT"
    }
  },
  "response": {
    "statusCode": 400,
    "body": {
      "error": {
        "code": 400,
        "message": "Request contains an invalid argument.",
        "status": "INVALID_ARGUMENT"
      }
    },
    "headers": {
      "vary": "X-Origin, Referer, Origin,Accept-Encoding",
      "content-type": "application/json; charset=UTF-8",
      "date": "Sun, 13 Sep 2020 19:29:41 GMT",
      "server": "ESF",
      "cache-control": "private",
      "x-xss-protection": "0",
      "x-frame-options": "SAMEORIGIN",
      "x-content-type-options": "nosniff",
      "alt-svc": "h3-29=\":443\"; ma=2592000,h3-27=\":443\"; ma=2592000,h3-T051=\":443\"; ma=2592000,h3-T050=\":443\"; ma=2592000,h3-Q050=\":443\"; ma=2592000,h3-Q046=\":443\"; ma=2592000,h3-Q043=\":443\"; ma=2592000,quic=\":443\"; ma=2592000; v=\"46,43\"",
      "accept-ranges": "none",
      "transfer-encoding": "chunked"
    },
    "request": {
      "uri": {
        "protocol": "https:",
        "slashes": true,
        "auth": null,
        "host": "firebaserules.googleapis.com",
        "port": 443,
        "hostname": "firebaserules.googleapis.com",
        "hash": null,
        "search": null,
        "query": null,
        "pathname": "/v1/projects/brianneisler-test:test",
        "path": "/v1/projects/brianneisler-test:test",
        "href": "https://firebaserules.googleapis.com/v1/projects/brianneisler-test:test"
      },
      "method": "POST"
    }
  }
}
```

### Reproduction locally using fresh project
- on command line, init for existing project
- npm i -g firebase-tools
- firebase init
- using spacebar select "firestore"
- select "use an existing project"
- select the name of the existing project created during setup
- click enter
- accept the default file names for `firestore.rules` and `firestore.indexes.json`
- replace the firestore.rules file with the file from example project 
- publish rules only "firebase deploy --only firestore:rules --debug"
- An error should be returned and rules will faile to deploy. Error will look
  like this...
```
Error: HTTP Error: 400, Request contains an invalid argument.
[2020-09-13T19:29:41.552Z] Error Context: {
  "body": {
    "error": {
      "code": 400,
      "message": "Request contains an invalid argument.",
      "status": "INVALID_ARGUMENT"
    }
  },
  "response": {
    "statusCode": 400,
    "body": {
      "error": {
        "code": 400,
        "message": "Request contains an invalid argument.",
        "status": "INVALID_ARGUMENT"
      }
    },
    "headers": {
      "vary": "X-Origin, Referer, Origin,Accept-Encoding",
      "content-type": "application/json; charset=UTF-8",
      "date": "Sun, 13 Sep 2020 19:29:41 GMT",
      "server": "ESF",
      "cache-control": "private",
      "x-xss-protection": "0",
      "x-frame-options": "SAMEORIGIN",
      "x-content-type-options": "nosniff",
      "alt-svc": "h3-29=\":443\"; ma=2592000,h3-27=\":443\"; ma=2592000,h3-T051=\":443\"; ma=2592000,h3-T050=\":443\"; ma=2592000,h3-Q050=\":443\"; ma=2592000,h3-Q046=\":443\"; ma=2592000,h3-Q043=\":443\"; ma=2592000,quic=\":443\"; ma=2592000; v=\"46,43\"",
      "accept-ranges": "none",
      "transfer-encoding": "chunked"
    },
    "request": {
      "uri": {
        "protocol": "https:",
        "slashes": true,
        "auth": null,
        "host": "firebaserules.googleapis.com",
        "port": 443,
        "hostname": "firebaserules.googleapis.com",
        "hash": null,
        "search": null,
        "query": null,
        "pathname": "/v1/projects/brianneisler-test:test",
        "path": "/v1/projects/brianneisler-test:test",
        "href": "https://firebaserules.googleapis.com/v1/projects/brianneisler-test:test"
      },
      "method": "POST"
    }
  }
}
```



