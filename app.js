const express = require('express')
const app = express()
const mustache = require('mustache-express')
const session = require('express-session')
const bodyParser = require('body-parser')
const fs = require('fs')
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
let guessesLeft = 8
let sess;
let guess;
let word;
let lettersGuessed = []

function generateGuess(wordLength) {
  let guess = []
  for (var i = 0; i < wordLength; i++) {
    guess[i] = "_ "
  }
  return guess.join('')
}

app.set('view engine', 'mustache')
app.engine('mustache', mustache())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.listen(3000, function() {
  console.log("App is live!")
})

app.get('/', function(req, res) {
  sess = req.session
  if (!sess.word) {
      const randomIndex = Math.floor(Math.random()*(words.length-1))
      word = words[randomIndex]
      sess.word = word
      guess = generateGuess(word.length)
  }
  res.render('index', {
      word: sess.word,
      guess: guess,
      guessesLeft: guessesLeft
    })
  })

app.post('/checkguess', function(req, res) {
  guessesLeft -= 1
  const guessLetter = req.body.letter
  const letters = word.split('')
  const updateGuess = guess.split('')
  if (guessesLeft) {
    for (var i = 0; i < letters.length; i++) {
      const letter = letters[i]
      if (letter === guessLetter) {
        updateGuess[i] = guessLetter
      }
    }

    guess = updateGuess.join('')
    res.redirect('/')
  } else {
    res.send("You're out of turns!")
  }

})
