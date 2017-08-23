const fs = require('fs')
const words = fs.readFileSync("./data/words.txt", "utf-8").toLowerCase().split("\n");
let inWord
let leaders = [{image: 'bailey.jpg' , name: 'Bailey', difficultyValue: 1, difficulty: 'Hard', guessesLeft: 8, date: '6/12/2017'}, {image: 'sticky.png', name: 'Sticky', difficultyValue: 3, difficulty: 'Easy', guessesLeft: 1, date: '6/24/2017'}]

function generateWord(words, max, min) {
  let foundWord = false
  while (!foundWord) {
    const randomIndex = Math.floor(Math.random()*(words.length-1))
    if (words[randomIndex].length >= min && words[randomIndex].length <=max) {
      word = words[randomIndex].toUpperCase()
      foundWord = true
    }
  }
  return word
}

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

function checkGuess(word, guess, guessLetter, guessesLeft) {
  const letters = word.split('')
  const updateGuess = guess.split(' ')
  inWord = false
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
  return updateGuess.join(' ')
}

function isInWord() {
  return inWord
}

function checkWinner(word, guess, guessesLeft) {
  if (guessesLeft) {
    if (word === guess.split(' ').join('')) {
      results = 'You won!'
      winner = true
      return true
    } else {
      return false
    }
  } else {
    results = 'You lost!'
    winner = false
    return true
  }
}

function sortLeaders(leaders){
  leaders.sort(function(a,b) {
    if (b.difficultyValue === a.difficultyValue) {
      return b.guessesLeft - a.guessesLeft
    }
    return a.difficultyValue - b.difficultyValue

  })
}

module.exports = {
  generateWord: generateWord,
  generateGuess: generateGuess,
  wasLetterGuessed: wasLetterGuessed,
  checkGuess: checkGuess,
  checkWinner: checkWinner,
  words: words,
  leaders: leaders,
  isInWord: isInWord,
  sortLeaders: sortLeaders
}
