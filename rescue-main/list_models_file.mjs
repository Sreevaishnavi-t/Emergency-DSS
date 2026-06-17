import fs from 'fs';

async function listModels() {
    try {
        const envFile = fs.readFileSync('.env', 'utf8');
        const keyMatch = envFile.match(/VITE_GEMINI_API_KEY=(.+)/);

        if (!keyMatch || !keyMatch[1]) {
            console.error("Error: Could not find VITE_GEMINI_API_KEY in .env file");
            process.exit(1);
        }

        const apiKey = keyMatch[1].trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);

        let output = "";

        if (!response.ok) {
            output += `HTTP Error: ${response.status} ${response.statusText}\n`;
            const text = await response.text();
            output += `Response Body: ${text}\n`;
        } else {
            const data = await response.json();
            if (data.models) {
                output += `Found ${data.models.length} models:\n`;
                data.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        output += `Model: ${m.name}\n`;
                    }
                });
            } else {
                output += `No models found in response: ${JSON.stringify(data, null, 2)}\n`;
            }
        }

        fs.writeFileSync('models_list.txt', output, 'utf8');
        console.log("Written to models_list.txt");

    } catch (error) {
        console.error("Error listing models:", error);
        fs.writeFileSync('models_list.txt', `Error: ${error.message}`, 'utf8');
    }
}

listModels();
