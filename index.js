require("dotenv").config();

const Discord = require("discord.js");

const { DISCORD_BOT_TOKEN } = process.env;

let isGameStarted = false;
const words = ["NICE", "LATENCE", "CODE", "BLABLA"];
let currentWord = {
  solution: null,
  mystery: null,
  displayMystery: null,
};

let lettersSaid = [];
const defaultTries = 10;
let tries = defaultTries;

const client = new Discord.Client();

client.on("ready", () => {
  console.log("Logged in on server!");
});

client.on("message", (msg) => {
  //   console.log("msg", msg);
  //   console.log("msg.channel.name", msg.channel.name);

  if (msg.channel.name !== "bottesting") {
    return;
  }

  if (isGameStarted === false) {
    if (msg.content.startsWith("!pendu") === true) {
      msg.channel.send("Le jeu va démarrer dans 5 secondes!");
      // setTimeout(/* fn */, /* time in ms */);
      currentWord = getRandomWord();
      setTimeout(() => {
        msg.channel.send(`Le mot à deviner est : ${currentWord.mystery}`);
      }, 5000);
      isGameStarted = true;
    }

    return;
  }

  // if isGameStarted is true

  // check for a word
  if (msg.content.length > 1 && msg.content.split(" ").length === 1) {
    if (currentWord.solution === msg.content.toUpperCase()) {
      msg.channel.send(`Bravo! Le mot a été trouvé par : ${msg.author}`);
      restartGame();
    }
  }
  // check for a letter
  if (msg.content.length === 1) {
    const letter = msg.content.toUpperCase();
    if (letter.charCodeAt(0) < 65 || letter.charCodeAt(0) > 90) {
      msg.reply(`Le caractère [${letter}] n'est pas reconnu`);
      return;
    }
    // going to check letter
    if (isLetterInWord(letter) === true) {
      msg.channel.send(`${currentWord.mystery}`);
      if (currentWord.mystery.match(/\?/) === null) {
        msg.channel.send(`Bravo! Le mot a été trouvé par : ${msg.author}`);
        restartGame();
      }
    } else {
      // error

      if (lettersSaid.includes(letter) === false) {
        lettersSaid.push(letter);
        tries--;
      }

      msg.channel.send(
        `La lettre [${letter}] n'est pas dans le mot. Essai restant: ${tries} / ${defaultTries}`
      );

      if (tries === 0) {
        // lose game
        msg.channel.send(`PERDU ! Le mot était : ${currentWord.solution}`);
        restartGame();
      }
    }
  }
});

const getDisplayText = (text) => {
  const message = [];

  text.split("").forEach((letter) => {
    let emoji = `:regional_indicator_${letter.toLowerCase()}:`;
    if (letter === "?") {
      emoji = `:grey_question:`;
    }
    message.push(emoji);
  });

  return message.join(" ");
};

const getMysteryFromSolution = (word) => {
  const wordsArr = word.split("");
  const mystery = wordsArr.map((letter, index) => {
    if (index === 0 || index === wordsArr.length - 1) {
      return letter;
    }
    return "?";
  });

  return mystery.join("");
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const getRandomWord = () => {
  const rand = getRandomInt(words.length - 1);
  //   console.log("rand", rand);
  const solution = words[rand];

  const mystery = getMysteryFromSolution(solution); // C??E - L?????E

  //   console.log("mystery", mystery);

  return {
    solution,
    mystery,
  };
};

const isLetterInWord = (letter) => {
  const isPresent =
    currentWord.solution.match(new RegExp(letter, "i")) !== null;

  // N??E
  // NICE
  // I

  if (isPresent === false) {
    return isPresent;
  }

  const mysteryArr = currentWord.mystery.split("");
  const solutionArr = currentWord.solution.split("");
  currentWord.mystery = mysteryArr
    .map((mLetter, index) => {
      const sLetter = solutionArr[index];
      if (mLetter !== "?") {
        return mLetter;
      }

      if (sLetter === letter) {
        return sLetter;
      }
      return "?";
    })
    .join("");

  return isPresent;
};

const restartGame = () => {
  isGameStarted = false;
  tries = defaultTries;
  lettersSaid = [];
};

client.login(DISCORD_BOT_TOKEN);
