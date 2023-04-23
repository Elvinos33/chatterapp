import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const prompt = req.body.prompt;
        console.log("Question: " + prompt)

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
        });

        const response = completion.data.choices[0].message;

        console.log(response)

        res.status(200).json({ response });
    } else {
        res.status(400).json({ error: 'Invalid request method' });
    }
}
