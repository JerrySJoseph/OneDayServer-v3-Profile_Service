const Profile=require('../Models/Profile');

function prepareProfileObject(data)
{
    return new Profile({
        _id:data._id,
        name:data.name,
        dob:data.dob,
        bio:data.bio,
        gender:data.gender,
        interestedIn:data.interestedIn,
        jobTitle:data.jobTitle,
        company:data.company,
        school:data.school,
        verified:data.verified,
        nickName:data.nickName,
        displayPicture:data.displayPicture,
        portfolio:data.portfolio,
        interests:data.interests,
        notifToken:data.notifToken,
       deviceId:data.deviceId,
       phone:data.phone,
       email:data.email,
       district:data.district,
       state:data.state,
       latitude:data.latitude,
       longitude:data.longitude,
       authMethod:data.authMethod,
       country:data.country
    })
}

module.exports.prepareProfileObject=prepareProfileObject;