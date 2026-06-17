import fs from 'fs';

async function listModels() {
    try {
        console.log("--- START MODEL LIST ---");
        const envFile = fs.readFileSync('.env', 'utf8');
        const keyMatch = envFile.match(/VITE_GEMINI_API_KEY=(.+)/);

        if (!keyMatch || !keyMatch[1]) {
            console.error("Error: Could not find VITE_GEMINI_API_KEY in .env file");
            process.exit(1);
        }

        const apiKey = keyMatch[1].trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response Body:", text);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log(`Found ${data.models.length} models:`);
            data.models.forEach(m => {
                // Filter specifically for generateContent capable models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`Model: ${m.name}`);
                }
            });
        } else {
            console.log("No models found in response:", JSON.stringify(data, null, 2));
        }
        console.log("--- END MODEL LIST ---");

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
