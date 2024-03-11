const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const readline = require("readline");

let history = [];

function addHistory(message, isUser) {
    let val_role = isUser ? "user" : "model";
    let historyJson = {
        role: val_role,
        parts: [{ text: message }]
    };
    history.push(historyJson);
}

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "test_lOzu4xm6GkrnWNkBB3iNAhk6Zj4omggan97jrTTp";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function sendChat(message) {
    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: history
    });

    const result = await chat.sendMessage(message);
    addHistory(message, true);
    const response = result.response;
    addHistory(response.text(), false);
    return response.text();
}

function waitForUserInput() {
    rl.question("> ", async function (answer) {
        if (answer == "exit;") {
            rl.close();
        } else if (answer == "clear;"){
            console.clear();
            waitForUserInput();
        }
        else if (answer == "history;") {
            const historyx = history.map((item) => { if (item.role == "user") return item.parts[0].text; });
            console.log(historyx);
            waitForUserInput();
        } else {
            const res = await sendChat(answer);
            console.log(res);
            waitForUserInput();
        }
    });
}

async function main() {
    waitForUserInput();
}

main();

