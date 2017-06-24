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
let displayMessage;
let leaders = [{image: '/uploads/bailey.jpg' , name: 'Bailey', guessesLeft: 8, date: 'June 12, 2017'}]

function generateGuess(wordLength) {
  let guess = []
  for (var i = 0; i < wordLength; i++) {
    guess[i] = "_ "
  }
  return guess.join('')
}

function wasLetterGuessed(guessLetter, lettersGuessed) {
  for (var i = 0; i < lettersGuessed.length; i++) {
    const letter = lettersGuessed[i]
    if (letter === guessLetter) {
      return true
    }
  }
  return false
}

function checkGuess(word, guess, guessLetter) {
  const letters = word.split('')
  const updateGuess = guess.split(' ')
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
  inWord = false
  return updateGuess.join(' ')
}

function checkWinner(word, guess) {
  if (guessesLeft) {
    if (word === guess.split(' ').join('')) {
      results = 'You won!'
      return true
    } else {
      return false
    }
  } else {
    results = 'You lost!'
    return true
  }
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
    res.render('index', {
        word: sess.word,
        guess: guess,
        guessesLeft: guessesLeft,
        lettersGuessed: lettersGuessed,
        displayMessage: displayMessage
      })
  })

app.post('/checkguess', function(req, res) {
  const guessLetter = req.body.letter.toUpperCase()
  displayMessage = ''
  req.checkBody('letter', 'Please enter a letter').len(1,1).isAlpha()
  errors = req.validationErrors()
  if (!errors) {
    if (guessesLeft) {
      if (wasLetterGuessed(guessLetter, lettersGuessed)) {
        displayMessage = "You already guessed that letter"
      } else {
        lettersGuessed.push(guessLetter)
        guess = checkGuess(word, guess, guessLetter)
        if (checkWinner(word, guess)) {
          return res.redirect('/results')
        }
      }
    }
  } else {
    displayMessage = errors[0].msg
  }
  res.redirect('/')
})

app.get('/reset', function(req, res) {
  sess = req.session
  sess.word = ''
  guessesLeft = 8
  lettersGuessed = []
  res.redirect('/')
})

app.get('/results', function(req, res) {
  sess = req.session
  res.render('results', {
    results: results,
    word: word
  })
})

app.get('/leaderboard', function(req, res) {
  sess = req.session
  const date = new Date()
  const month = date.getMonth()
  const day = date.getDate()
  const year = date.getFullYear()
  const fullDate = `${month} ${day}, ${year}`
  console.log(date.toDateString());
  res.render('leaderboard', {
    leaders: leaders
  })
})
