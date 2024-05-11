const fs=require('fs');
const axios=require('axios');

const API_URL="http://localhost:3000";

async function createDevice(name){
    try{
        const response=await axios.post(`${API_URL}/devices`,{
            name
        });
        const deviceId=response.data.id;
        console.log(`Device created: ${name} (ID: ${deviceId})`);
        return deviceId;
    } catch (error){
        console.error('Error creating device:',error);
        return null;
    }
}

async function uploadTelemetry(deviceId,filePath){
    try{
        const data=fs.readFileSync(filePath,'utf-8').split('\n');
        data.shift();
        for (const row of data){
            const [timestamp, temperature, humidity, pressure, windSpeed, windGust, windDirection] = row.split(',');
            const telemetry={
                timestamp: parseInt(timestamp), // Convert timestamp to integer (adjust if needed)
                temperature: parseFloat(temperature),
                humidity: parseInt(humidity),
                pressure: parseFloat(pressure),
                wind_speed: parseFloat(windSpeed),
                wind_gust: parseFloat(windGust),
                wind_direction: parseInt(windDirection),
        };
        await axios.post(`${API_URL}/telemetry/${deviceId}`,telemetry);
    }
        console.log('Telemetry uploaded:',response.data);
    } catch (error){
        console.error('Error uploading telemetry:',error);
    }
}

async function main(){
    const deviceName='My Device';
    const deviceId=await createDevice(deviceName);
    if (!deviceId){
        return;
    }
    const filePath='data.csv';
    await uploadTelemetry(deviceId,filePath);
}

main();