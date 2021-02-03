//Importing Required Libraries
const mongoose=require('mongoose');
//Models
const Profile=require('./Models/Profile')
//Custom Components and Helpers
const log=require('./Utils/log');
const Queue= require('./Utils/RMQConnection')
const {PullRequest}=require('./Utils/RequestHandler')
const {prepareProfileObject} = require('./Utils/ProfileHelper')


let DB_URI=process.env.PROFILE_DB_CONNECTION_STRING;
if(!DB_URI)
    DB_URI='mongodb://localhost:27017/one_day_profiles_db';
    
//Initialize Profile Service System
InitSystem();


//Init Entire Service System
function InitSystem()
{
    //Connecting to Database
    mongoose.connect(DB_URI,
        {useNewUrlParser:true,useUnifiedTopology:true},
        (error)=>{
            if(error)
                {
                log.error(error.message);
                log.entry('Attempting to Reconnect to Database');
                InitSystem();
                } 
            
            log.info('Connected to Database')
            //Register Events after Database Connection
            RegisterQueueEvents();
                
        })

}


//Registering Pull Requests for Queues
function RegisterQueueEvents()
{
    Queue.getMyConnection.then((connection)=>{
         connection.createChannel((err,channel)=>{
                PullRequest({exchange:'user',routingKey:'user.event.create'},channel,createEvent);
                PullRequest({exchange:'user',routingKey:'user.event.update'},channel,updateEvent);
                PullRequest({exchange:'user',routingKey:'user.event.delete'},channel,deleteEvent);
                PullRequest({exchange:'user',routingKey:'user.event.fetch'},channel,fetchEvent);
                log.info('Events Registered')  
         })
    })
     
}
//Create Event handler
const createEvent=(data,onFinish)=>{
     const userObject=prepareProfileObject(data);
            userObject.updateOne(userObject,{upsert:true},(err,result)=>{
                let response=null;
                if(err)
                    response={
                        success:false,
                        message:err.message
                    }
                else
                    response={
                        success:true,
                        message:'Profile Created Successfully'
                    }
            onFinish(response)
            })
}

//Update Event Handler
const updateEvent=async (data,onFinish)=>{
    const user=await Profile.findOne({_id:data._id})
    if(user)
        Profile.updateOne({_id:data._id},data,(err,result)=>{
            let response=null;
            if(err)
                response={
                    success:false,
                    message:err.message
                }
            else
                response={
                    success:true,
                    message:'Profile Updated Successfully'
                }
            onFinish(response)
        })
    else
        onFinish(response={
                    success:false,
                    message:'No user with this ID exists'
                })
}
//Delete Event Handler 
const deleteEvent=async(data,onFinish)=>{

    await Profile.deleteOne({_id:data._id})
    onFinish(response={
                    success:true,
                    message:'User with ID: '+data._id+' deleted.'
                })
}

const fetchEvent= async(data,onFinish)=>{
    Profile.find(data,(err,profiles)=>{
        if(err)
            return  onFinish(response={
                    success:false,
                    message:'No user with this ID exists'
                })
            return onFinish(profiles)
    })
}