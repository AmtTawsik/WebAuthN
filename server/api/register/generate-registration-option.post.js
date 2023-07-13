import { generateRegistrationOptions } from "@simplewebauthn/server"
import { base64urlToUint8 } from "../../helper/functions"
import { useRealm } from "../../helper/realm"


export default defineEventHandler(async (event)=>{
    const {mongo}=useRealm()
    const userCollection=mongo?.db(useRuntimeConfig().public.db).collection('users')
    try {
        const { email } = await readBody(event)
        const user = await userCollection.findOne({ email })
        if(!user){
            setResponseStatus(event,400)
            return {
                error:"user doesn't exist"
            }
        }
        const authenticators = user?.devices
        const options = generateRegistrationOptions({
            rpName:useRuntimeConfig().public.rpName,
            rpID:useRuntimeConfig().public.rpId,
            userID: user._id.toString(),
            userName: user.name,
            attestationType: "none",
            excludeCredentials: authenticators?.map(authenticator => ({
                id: base64urlToUint8(authenticator?.credentialID),
                type: "public-key",
                transports: authenticator?.transports
            }))
        })
        await userCollection.updateOne({_id:user._id}, { $set: { challenge: options.challenge } })
        return options
    }
    catch (error) {
        console.log(error)
        setResponseStatus(event,500)
        return {
            error:"Server Error!!"
        }
    }
})