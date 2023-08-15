/* 
    Program: AiConsoleChat.cjs
    See readme.txt for more information
    Kristian Virtanen, 2023
    krisu.virtanen@gmail.com
    GNU General Public License v3.0
    Source code https://github.com/EkBass/AiConsoleChat
   
*/

// Set your own API key here
// Get it from https://beta.openai.com/
// For the record, hardcoding API key is not recommended.
// I do it here for simplicity.
// Use environment variables instead.
const MyApiKey = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";



// human and AI messages are seperated by a tags.
const humanName             = "Krisu";                      // name of human
const aiName                = "Bob";                        // name of AI
const humanStart            = "<" + humanName + ">";        // human start tag
const humanEnd              = "</" + humanName + ">";       // human end tag
const aiStart               = "<AI>";                       // AI start tag
const aiEnd                 = "</AI>";                      // AI end tag
const codeTagStartAlias     = "<<<";                        // code start tag alias
const codeTagEndAlias       = ">>>";                        // code end tag alias
const codeTag               = "\n<code>\n";                 // code start tag
const codeTagEnd            = "\n</code>\n";                // code end tag
const logShort              = "logShort.txt";               // short log file
const logFile               = "log.txt";                    // log file
const fileOpenTag           = "<file>";                     // file open tag when sending file to AI
const fileCloseTag          = "</file>";                    // file close tag when sending file to AI


// include fs, its used to read files
const fs = require('fs');

// include readline, its used to read user input from keyboard
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'human: '
});

// include OpenAIApi, the hero of this program
const { Configuration, OpenAIApi } = require("openai");
const { fail } = require('assert');
const configuration = new Configuration({
  apiKey: MyApiKey,
});
const openai = new OpenAIApi(configuration);


// file "context.txt" includes instructions and context for the AI.
// It is allways passed to the AI as starting point for the conversation.
const context = fs.readFileSync("context.txt", "utf8") + "\n";
 
// variable shortHistory is used to store short history of chat.
let shortHistory = shortHistoryAdjust("", "");

// variable which stores AI codes aslong as program is running
// if user types ---catch, the code is written to file "catch.txt"
// its global now, so it can be used in other functions
// could have done better, but this is just a demo
let catchCode = "";


// So basicly program starts here
console.clear();
console.log("AiConsoleChat.cjs\nType ---help for help\n\n");

// program runs in loop until user types ---exit, ---quit or ---bye
rl.prompt(`${humanName}: `);
rl.on('line', async (userInput) => {
    userInput = userInput.trim();

    // tokenise user input in function tokeniseUserInput by spaces and return array
    let tokenArray = tokeniseUserInput(userInput);
    const firstToken = tokenArray[0];
    // decisions by userInput

    // exit application
    if (firstToken === "---exit"  || firstToken === "---quit" || firstToken === "---bye") {
            rl.close();
            console.log("Bye!");
            process.exit();
    }
    // clear screen
    if(firstToken === "---clear" || firstToken === "---cls") {
        console.clear();
    }
    // if ---catch and show, then show catchCode
    if(firstToken === "---catch" && tokenArray[1] === "show") {
        console.log(catchCode);
    }
    // if ---catch and clear, then clear catchCode
    if(firstToken === "---catch" && tokenArray[1] === "clear") {
        catchCode = "";
        console.log("catchCode cleared");
    }
    // if ---catch and write, then write catchCode to file
    if(firstToken === "---catch" && tokenArray[1] === "file:" && tokenArray[2] !== "") {
        // write catchCode to file
        fs.writeFileSync(tokenArray[2], catchCode);
        console.log("Code written to file " + tokenArray[2]);
        // let's leave code there until new one comes
    }
    // reset short history
    if(firstToken === "---reset") {
        shortHistory = "";
    }
    // print short history
    if(firstToken === "---history") {
        console.log(shortHistory);
    }
    // show help
    if (firstToken === "---help") {
        console.log(fs.readFileSync("help.txt", "utf8"));        
    }
    // show context
    if (userInput === "---context") {
        console.log(context);
    }
    // Load textfile in user input
    if (userInput.startsWith("---load")) {
        // check if file exists
        if (fs.existsSync(tokenArray[1])) {
            // load file
            let file = fs.readFileSync(tokenArray[1], "utf8");
            // add file to user input and send if by replacing user input

            userInput = fileOpenTag + file + fileCloseTag;
            // file must output to console
            console.log(tokenArray[11] + ": " + file);
        } else {
            console.log("File not found!");
        }
    }
    try {
        // send userInput to AI if it is not a command or empty
        if (userInput !== "" && !userInput.startsWith("---")) {
            // create prompt
            const prompt = createPrompt(userInput);
            // adjust shortHistory with new message from user
            shortHistory = shortHistoryAdjust(shortHistory, prompt);
            // update log
            writeLog(logFile, prompt);
            // send prompt to OpenAI
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: context + prompt,
                temperature: 0.9,
                max_tokens: 256, 
                top_p: 1,
                frequency_penalty: 0.0,
                presence_penalty: 0.6,
            });

            // receive response from OpenAI
            let response = completion.data.choices[0].text;
            // catch AI code
            catchCode = catchAiCode(response);
            // AI adds tags to the response itself, we just add timestamp
            response += getTimeStamp();
            // add response to shortHistory
            shortHistory = shortHistoryAdjust(shortHistory, response);
            // update log
            writeLog(logFile, response);
            // output AI response after a few stylings are done
            console.log(styleAiResponse(response));
        }
    } catch (error) {
        console.log("Something is fucked up!!! " + error);
    }
    rl.prompt(`\n${humanName}: `);
    // end of main loop
});
// End of main program


// function catches contents of code from last AI message. 
// If user then types ---catch, the code is written to file "catch.txt"
function catchAiCode(message) {
    // check if message contains <code> tag
    if(message.includes("<code>")) {
        // get code from message
        let code = message.split("<code>")[1].split("</code>")[0];
        // add code to catchCode
        catchCode += code;
    }
    return catchCode;
}


// function tokenises user input by spaces and returns array
function tokeniseUserInput(userInput) {
    let userInputArray = userInput.split(" ");
    return userInputArray;
}


// function styles AI response
function styleAiResponse(response) {
    // for chat console, we change AI to Bob
    response = response.replace(aiStart, aiName + ": ");
    response = response.replace(aiEnd, "");
    
    // Force linebreak after each 40 characters
    // But not in the middle of a word or if inside <code> tag
    let responseArray = response.split(" ");
    let responseArrayNew = [];
    let lineLength = 0;
    let codeTag = false;
    for (let i = 0; i < responseArray.length; i++) {
        // check if we are inside <code> tag
        if(responseArray[i].includes("<code>")) {
            codeTag = true;
        }
        if(responseArray[i].includes("</code>")) {
            codeTag = false;
        }
        // if line is too long, add linebreak
        if(lineLength > 40 && !codeTag) {
            responseArrayNew.push("\n");
            lineLength = 0;
        }
        // add word to new array
        responseArrayNew.push(responseArray[i]);
        // add length of word to lineLength
        lineLength += responseArray[i].length;
    }
    // join array to string
    response = responseArrayNew.join(" ");

    // replace AI as Bob
    response = response.replace(aiStart, aiName + ": ");
    response = response.replace(aiEnd, "");

    // but keep code tags for better viewing
    return response;
}
    
// function creates prompt for OpenAI
function createPrompt(userInput) {
    let prompt = humanStart + userInput + humanEnd + getTimeStamp();

    // code alises "<<<" and ">>>" converted as <code> and </code> tags
    prompt = prompt.replace(codeTagStartAlias, codeTag);
    prompt = prompt.replace(codeTagEndAlias, codeTagEnd);
    return prompt;
}

// function returns a timestamp in form DD:MM:YY HH:MM:SS
function getTimeStamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return "\n<ts>" + day + "." + month + "." + year + " " + hour + ":" + minute + ":" + second + "</ts>\n";
}


// function adjusts shortHistory. If it is too long, it is shortened.
// If it is empty, it is read from file.
// If it is ok, newMessage is added to it.
function shortHistoryAdjust(shortHistory, newMessage) {
    // if shortHistory is empty, read it from file
    if(shortHistory.length < 1) {
        shortHistory = fs.readFileSync(logShort, "utf8");
    }
    
    
    // if check lenght of shortHistory > 1024
    while(shortHistory.length > 1024) {
        // get location of first timestamp
        let firstTimestamp = shortHistory.indexOf("</ts>");
        // remove everything before first timestamp
        shortHistory = shortHistory.slice(firstTimestamp + 5);

        // keep looping until shortHistory is ok
    }

    
    // lenght is ok, so we add newMessage to shortHistory
    shortHistory += newMessage;
        
    // write shortHistory to file
    fs.writeFile(logShort, shortHistory, (err) => {
        if (err) {
            console.log("Error writing file: " + err);
        }
    });
    return shortHistory;
}

// Write log to file
function writeLog(logFile, logMessage) {
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) {
            console.log("Error writing file: " + err);
        }
    });
}

// Thank you and goodbye
