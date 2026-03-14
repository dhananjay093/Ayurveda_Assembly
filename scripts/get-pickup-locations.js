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
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                value = value.slice(1, -1);
            }
            env[key.trim()] = value;
        }
    });
    return env;
}

const env = getEnv();

async function getPickupLocations() {
    try {
        const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: env.SHIPROCKET_EMAIL,
                password: env.SHIPROCKET_PASSWORD,
            }),
        });
        const authData = await authResponse.json();
        const token = authData.token;

        const response = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (data.data && data.data.shipping_address) {
            console.log('---NICKNAMES---');
            data.data.shipping_address.forEach(addr => {
                console.log(addr.pickup_location);
            });
            console.log('---END---');
        }
    } catch (error) { }
}

getPickupLocations();
