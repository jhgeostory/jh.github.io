
import dotenv from 'dotenv';
import axios from 'axios';

// Load .env explicitly for standalone script execution
dotenv.config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

(async () => {
    console.log('--- Discord Webhook Test ---');

    if (!webhookUrl) {
        console.error('ERROR: DISCORD_WEBHOOK_URL is not found in .env file.');
        console.error('Please ensure you have created a .env file with this variable.');
        process.exit(1);
    }

    console.log(`Found Webhook URL: ${webhookUrl.substring(0, 35)}...`);

    try {
        console.log('Sending test message...');
        await axios.post(webhookUrl, {
            content: '✅ **G2B Monitor**: This is a test notification to verify your Discord settings.'
        });
        console.log('Successfully sent! Please check your Discord channel.');
    } catch (error: any) {
        console.error('Failed to send message.');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
    }
})();
