const express = require('express');
const router = express.Router();
const words = require('../models/words')
const session = require('express-session')
const Busboy = require('busboy')
const path = require('path')
const fs = require('fs')
let guessesLeft = 8
let sess;
let guess;
let word;
let lettersGuessed = []
let errors;
let displayMessage;
let leaderName;
let difficulty;
let difficultyValue;
let leaders = words.leaders



router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

router.get('/', function(req, res) {
  sess = req.session
    res.render('index', {
        word: sess.word,
        guess: guess,
        guessesLeft: guessesLeft,
        lettersGuessed: lettersGuessed,
        displayMessage: displayMessage
      })
  })

  router.get('/easy', function(req, res) {
    sess = req.session
    displayMessage = ''
    if (!sess.word) {
      word = words.generateWord(words.words, 5, 3)
      sess.word = word
      guess = words.generateGuess(word.length)
      difficulty = 'Easy'
      difficultyValue = 3
    }

    res.redirect('/')
  })

  router.get('/normal', function(req, res) {
    sess = req.session
    displayMessage = ''
    if (!sess.word) {
      word = words.generateWord(words.words, 8, 6)
      sess.word = word
      guess = words.generateGuess(word.length)
      difficulty = 'Normal'
      difficultyValue = 2
    }

    res.redirect('/')
  })

  router.get('/hard', function(req, res) {
    sess = req.session
    displayMessage = ''
    if (!sess.word) {
      word = words.generateWord(words.words, 1000, 8)
      sess.word = word
      guess = words.generateGuess(word.length)
      difficulty = 'Hard'
      difficultyValue = 1
    }

    res.redirect('/')
  })

  router.post('/checkguess', function(req, res) {
    const guessLetter = req.body.letter.toUpperCase()
    displayMessage = ''
    if (!difficulty) {
      displayMessage = "Please select a difficulty!"
      return res.redirect('/')
    }
    req.checkBody('letter', 'Please enter a letter').len(1,1).isAlpha()
    errors = req.validationErrors()
    if (!errors) {
      if (guessesLeft) {
        if (words.wasLetterGuessed(guessLetter, lettersGuessed)) {
          displayMessage = "You already guessed that letter"
        } else {
          lettersGuessed.push(guessLetter)
          guess = words.checkGuess(word, guess, guessLetter, guessesLeft)
          if (!words.isInWord()) {
            guessesLeft -= 1
          }
          if (words.checkWinner(word, guess, guessesLeft)) {
            return res.redirect('/results')
          }
        }
      }
    } else {
      displayMessage = errors[0].msg
    }
    res.redirect('/')
  })

  router.get('/results', function(req, res) {
    sess = req.session
    res.render('results', {
      results: results,
      word: word,
      winner: winner
    })
  })

  router.get('/reset', function(req, res) {
    sess = req.session
    sess.word = ''
    guess = ''
    guessesLeft = 8
    lettersGuessed = []
    winner = false
    difficulty = ''
    res.redirect('/')
  })

  router.post('/leaderboard', function(req, res) {
    sess = req.session
    var busboy = new Busboy({ headers: req.headers });

    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    const fullDate = `${month}/${day}/${year}`
    let imageLocation


  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if (filename) {
      var saveTo = path.join('./public/uploads/', path.basename(filename));
      imageLocation = filename
      file.pipe(fs.createWriteStream(saveTo));

        file.on('end', function() {
        });
      } else {
        file.resume()
      }
      });

      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        if (fieldname === 'name') {
          leaderName = val
        }
      });
      busboy.on('finish', function() {
        leaders.push({image: imageLocation, name: leaderName, difficultyValue: difficultyValue, difficulty: difficulty, guessesLeft: guessesLeft, date: fullDate})
        words.sortLeaders(leaders)
        res.render('leaderboard', {
          leaders: leaders
        })
      });
      req.pipe(busboy);
  })



module.exports = router;
