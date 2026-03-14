const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=').trim();
            // Handle quotes
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                value = value.slice(1, -1);
            }
            env[key.trim()] = value;
        }
    });
    return env;
}

const env = getEnv();

async function testAuth() {
    console.log('Testing Shiprocket Auth...');
    console.log('Email:', env.SHIPROCKET_EMAIL);

    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: env.SHIPROCKET_EMAIL,
                password: env.SHIPROCKET_PASSWORD,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('SUCCESS! Token received.');
        } else {
            console.log('FAILED:', data.message || data);
            if (data.status_code === 401) {
                console.log('Error Code 401: Unauthorized. Please check if the account is locked or the password is correct.');
            }
        }
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

testAuth();
