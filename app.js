const express = require('express')
const app = express()
const mustache = require('mustache-express')
const session = require('express-session')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const fs = require('fs')
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
let guessesLeft = 8
let sess;
let guess;
let word;
let lettersGuessed = []
let inWord = false
let errors;

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
app.use(expressValidator())
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
      word = words[randomIndex].toUpperCase()
      sess.word = word
      guess = generateGuess(word.length)
  }
  if(errors) {
    res.render('index', {
        word: sess.word,
        guess: guess,
        guessesLeft: guessesLeft,
        lettersGuessed: lettersGuessed,
        errors: errors[0]
      })
  } else {
    res.render('index', {
        word: sess.word,
        guess: guess,
        guessesLeft: guessesLeft,
        lettersGuessed: lettersGuessed
      })
  }

  })

app.post('/checkguess', function(req, res) {
  const guessLetter = req.body.letter.toUpperCase()
  req.checkBody('letter', 'Please enter a letter').len(1,1).isAlpha()
  errors = req.validationErrors()
  console.log(errors[0].msg);
  lettersGuessed.push(guessLetter)
  const letters = word.split('')
  const updateGuess = guess.split(' ')
  if (guessesLeft) {
    for (var i = 0; i < letters.length; i++) {
      const letter = letters[i]
      if (letter === guessLetter) {
        updateGuess[i] = guessLetter
        inWord = true
      }
    }
    if (!inWord) {
      guessesLeft -= 1
    }
    guess = updateGuess.join(' ')
    inWord = false
    res.redirect('/')
  } else {
    res.send("You're out of turns!")
  }

})
