import fs from 'fs';
import https from 'https';

console.log("Verifying Gemini API Key...");

try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const keyMatch = envFile.match(/VITE_GEMINI_API_KEY=(.+)/);

    if (!keyMatch || !keyMatch[1]) {
        console.error("Error: Could not find VITE_GEMINI_API_KEY in .env file");
        process.exit(1);
    }

    const apiKey = keyMatch[1].trim();

    if (apiKey === "YOUR_API_KEY_HERE" || apiKey.includes("YOUR_ACTUAL_API_KEY_HERE")) {
        console.error("Error: Environment variable still has placeholder value.");
        process.exit(1);
    }

    console.log("API Key found. Testing connection...");

    const data = JSON.stringify({
        contents: [{
            parts: [{
                text: "Hello"
            }]
        }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    };

    const req = https.request(url, options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log("Success! API Key is valid and working.");
                try {
                    const json = JSON.parse(responseBody);
                    if (json.candidates && json.candidates.length > 0) {
                        console.log("Response received from Gemini.");
                    } else {
                        console.log("Response received but no candidates (might be blocked or empty). Raw response:", responseBody);
                    }
                } catch (e) {
                    console.log("Response received:", responseBody);
                }
            } else {
                console.error(`API Request failed with status: ${res.statusCode}`);
                console.error("Response:", responseBody);
                process.exit(1);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
        process.exit(1);
    });

    req.write(data);
    req.end();

} catch (err) {
    console.error("Error reading .env file or executing script:", err.message);
    process.exit(1);
}
