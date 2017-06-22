const express = require('express')
const app = express()
const mustache = require('mustache-express')
const session = require('express-session')
const bodyParser = require('body-parser')
const fs = require('fs')
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
let sess;

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
  const randomIndex = Math.floor(Math.random()*(words.length-1))
  const word = words[randomIndex]
  const guess = generateGuess(word.length)
  res.render('index', {
    word: word,
    guess: guess
  })
})
