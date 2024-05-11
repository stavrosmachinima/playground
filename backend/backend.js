const express=require('express')
const axios=require('axios')
require('dotenv').config();

const THINGSBOARD_URL="https://iot-staging.exm.gr/"

const JWT_TOKEN=process.env.JWT_TOKEN;

const app=express();
const port=3000;

app.use((req, res,next)=>{
 req.headers.Authorization=`Bearer ${JWT_TOKEN}`;
 next();   
});

//create
app.post('/devices',async (req,res)=>{
    try{
        const {name}=req.name;
        const response=await axios.post(`${THINGSBOARD_URL}/api/devices`,{
            name,
        });
        res.json(response.data);
    }catch(error){
        console.error(error);
        res.status(500).json({error:error.message});
    }
})

//delete
app.delete('/devices/:deviceId',async (req,res)=>{
    const { deviceId } = req.params;
    try{
        const response=await axios.delete(`${THINGSBOARD_URL}/api/v1/devices/${deviceId}`);
        res.json(response.data);
    }catch(error){
        console.error(error);
        res.status(500).json({error:error.message});
    }
});

//upload telemetry data
app.post('/telemetry/:deviceId',async (req,res)=>{
    const { deviceId } = req.params;
    try{
        const response=await axios.post(`${THINGSBOARD_URL}/api/v1/${deviceId}/telemetry`,req.body);
        res.json(response.data);
    }catch(error){
        console.error(error);
        res.status(500).json({error:error.message});
    }
});

//download aggregate telemetry
app.get('/telemetry/:deviceId',async (req,res)=>{
    const { deviceId } = req.params;
    try{
        const response=await axios.get(`${THINGSBOARD_URL}/api/v1/${deviceId}/telemetry/aggregate`);
        const telemetryData=response.data;
        const telemetryMap={};
    for (const telemetry of telemetryData){
        const {timestamp,temperature,humidity,pressure,wind_speed,wind_gust,wind_direction}=telemetry;
        const hour=new Date(timestamp).getHours();
        if (!telemetryMap[hour]){
            telemetryMap[hour]={
                temperature:0,
                humidity:0,
                pressure:0,
                wind_speed:0,
                wind_gust:0,
                wind_direction:0,
            };
        }
        telemetryMap[hour].temperature+=temperature;
        telemetryMap[hour].humidity+=humidity;
        telemetryMap[hour].pressure+=pressure;
        telemetryMap[hour].wind_speed+=wind_speed;
        telemetryMap[hour].wind_gust+=wind_gust;
        telemetryMap[hour].wind_direction+=wind_direction;
    }
    const aggregatedData=[];
    for (const hour in telemetryMap){
        const telemetry=telemetryMap[hour];
        aggregatedData.push({
            hour,
            temperature:telemetry.temperature,
            humidity:telemetry.humidity,
            pressure:telemetry.pressure,
            wind_speed:telemetry.wind_speed,
            wind_gust:telemetry.wind_gust,
            wind_direction:telemetry.wind_direction,
        });
    }
    res.json(aggregatedData);
    }catch(error){
        console.error(error);
        res.status(500).json({error:error.message});
    }
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});