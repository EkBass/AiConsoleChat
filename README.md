# Update 
18.09.2023

Due changes at models and API's at OpenAI, this projects is not good to use anymore. But i leave it here as example of how it was done back in days.

# AiConsoleChat
OpenAi Chat Bot with some neat features

/* This is readme.txt
    Program         : AiConsoleChat.cjs
    Description     : This is a simple chatbot that uses OpenAI API to generate responses.
                    : It is written in Node.js and uses OpenAI API.
                    : It is a console application and it is not a web application.
                    : It is a chatbot, not a chat application.
    
    Author          : Kristian Virtanen, krisu.virtanen@gmail.com
    
    Usage:          : Open file "readme.txt" and read instructions.
                    : Install nodejs, openai, readline and fs modules.
                    : Open file "context.txt" and write instructions and context for the AI.
                    : Open file "AiConsoleChat.cjs" and change MyApiKey to your own API key.
                    : run from console AiConsoleChat.bat

    Commands        : ---help                   : show help
                    : ---exit                   : exit application
                    : ---clear or ---cls        : clear screen
                    : ---catch show             : show catchCode
                    : ---catch clear            : clear catchCode
                    : ---catch file:filename    : write catchCode to file
                    : ---reset                  : reset short history
                    : ---history                : show short history
                    : ---context                : show context
                    : ---load filename          : load textfile in user input and send it to AI

    catchCode       : catchCode is a variable that stores the last piece of code that AI generated.
    shortHistory    : shortHistory is a variable that stores short history of chat.
                    : It is used to generate AI response.
                    : It is reset when user types ---reset.
    context         : context is a variable that stores instructions and context for the AI.
                    : It is allways passed to the AI as starting point for the conversation.
                    : It is loaded from file "context.txt" when program starts.
    logShort        : logShort is a file that stores short history of chat.
    
    Adjusting       : See const variables in the beginning of the file to adjust program.
                    : Adjust shortHistoryAdjust function to adjust short history.
                    : Adjust tokeniseUserInput function to adjust tokenisation.
                    : Adjust catchCodeAdjust function to adjust catchCode.
                    : Adjust shortHistoryAdjust function to adjust short history.
                    : Adjust aiResponseAdjust function to adjust AI response.

    License         : GNU General Public License v3.0
                    : https://www.gnu.org/licenses/gpl-3.0.en.html

    Source code     : https://github.com/EkBass/AiConsoleChat

    foo             : Some of my bass covers, including tutorials and lyric videos.
    url             : https://www.youtube.com/channel/UChrNQ4T6Xc3t0KrJtznutRw

    Slava Ukraini
*/
