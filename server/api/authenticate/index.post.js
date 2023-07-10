import { OTPGenerator } from "../../helper/functions"
import sendMail from "../../helper/gmail"
import { getServerUser, useRealm } from "../../helper/realm"

export default defineEventHandler(async (event)=>{
    const { app } = useRealm()
    let user=app?.currentUser || null
    if (!app?.currentUser) {
        user=await getServerUser()
    }
    const mongo=user?.mongoClient('mongodb-atlas')
    const userCollection = mongo?.db('webauthn')?.collection('users')
    const tokenCollection = mongo?.db('webauthn')?.collection('tokens')
    try {
        const {email}=await readBody(event)
        user=await userCollection.findOne({email})
        if(!user){
            setResponseStatus(event,400)
            return{
                error:"user doesn't exist"
            }
        }
        const {secret,token}=OTPGenerator()
        await tokenCollection.updateOne({user:user._id},{$set:{secret,created_at:new Date().toISOString(),user:user._id}},{upsert:true})
        sendMail({
            to:email,
            from:"Verification Mail<iamsoumo26@gmail.com>",
            subject:"Verification Mail",
            body:`<p>Your OTP is <span>${token}</span>. It is only valid for 60s, So hurry up!</p>`
        })
        setResponseStatus(event, 201)
        return {
            message: "otp sented"
        }
    } catch (error) {
        console.log(error)
        setResponseStatus(event,500)
        return {
            error:"Server Error!!"
        }
    }
})