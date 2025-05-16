# Sketchy "GenieTalk" Clone App

So the Github legend that is Annalu Waller (she has a GitHub coat for crying out loud) has a paper with Per Ola and Tom Griffiths on genieTalk - the output of ACE-LP. Its long awaited. It's cool. I wanted to play with it and couldnt. So I asked a coding agent to make it for me. (NB: Look at the PRD.md thats what it first made from everything it read and saw.. and then went off and did its thing)

So IP/Licence/credits are all TOTALLY to Annalu, Per Ola and Tom Griffiths. And a credit to the augmentcode.com app/VS Code.. Its mad you can make this stuff without looking at a line of code.  See the paper here: https://dl.acm.org/doi/10.1145/3703451 - and more on ACE-LP: https://aac.dundee.ac.uk/ace-lp/ and Annalu's Github Story: https://github.com/readme/stories/annalu-waller :) 

PPM Model - is Google's: https://github.com/google-research/google-research/tree/master/jslm (Brian Roark et al)

We are also using Keith Vertanens Prediction API which works well: https://api.imagineville.org/docs/ (but is online)

To switch - change the 

```json
"genietalkConfig": {
    "predictionModel": "api"
  }
```

In package.json to "ppm" or "api" - and then run the app.

No Joke - this took around an hour to make. What a crazy time to be alive. 