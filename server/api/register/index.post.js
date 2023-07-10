import { getServerUser, useRealm } from "../../helper/realm"
import sendMail from "../../helper/gmail"
import { OTPGenerator } from "../../helper/functions"


export default defineEventHandler(async (event) => {
    const { app } = useRealm()
    let user=app?.currentUser || null
    if (!app?.currentUser) {
        user=await getServerUser()
    }
    const mongo=user?.mongoClient('mongodb-atlas')
    const userCollection = mongo?.db('webauthn')?.collection('users')
    const tokenCollection = mongo?.db('webauthn')?.collection('tokens')
    try {
        const { name, email } = await readBody(event)

        let user = await userCollection.findOne({ email: email })
        if (user) {
            setResponseStatus(event, 400)
            return {
                error: "user already exists"
            }
        }
        user=await userCollection.insertOne({ name, email })
        const {secret,token}=OTPGenerator()
        await tokenCollection.updateOne({user:user.insertedId},{$set:{secret,created_at:new Date().toISOString(),user:user.insertedId}},{upsert:true})
        sendMail({
            to:email,
            from:"Verification Mail<iamsoumo26@gmail.com>",
            subject:"Verification Mail",
            body:`<p>Your OTP is <span style="font-weight:bold">${token}</span>. It is only valid for 60s, So hurry up!</p>`
        })
        setResponseStatus(event, 201)
        return {
            message: "user created"
        }
    } 
    catch (error) {
        console.log(error)
        setResponseStatus(event,500)
        return {
            error:"Server Error!!"
        }
    }
})