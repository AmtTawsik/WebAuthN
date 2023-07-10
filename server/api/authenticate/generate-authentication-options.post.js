import { generateAuthenticationOptions } from "@simplewebauthn/server"
import { base64urlToUint8 } from "../../helper/functions"
import { useRealm } from "../../helper/realm"

export default defineEventHandler(async(event)=>{
    const {mongo}=useRealm()
    const userCollection=mongo?.db('webauthn').collection('users')
    try {
        const { email, deviceId,mac } = await readBody(event)
        const user = await userCollection.findOne({ email })
        if (!user) {
            setResponseStatus(event, 400)
            return {
                error: "user doesn't exist"
            }
        }
        const authenticators = user.devices
        const device =mac?null:authenticators.find(device => device.id === deviceId)
        if (!device && !mac) {
            setResponseStatus(event, 401)
            return {
                error: "device not Recognized"
            }
        }
        const allowCredentials = authenticators.map(authenticator =>
        ({
            id: base64urlToUint8(authenticator?.credentialID),
            type: "public-key",
            transports: authenticator?.transports
        })
        )
        const options = generateAuthenticationOptions({
            allowCredentials,
            rpID:useRuntimeConfig().public.rpId,
            userVerification: "preferred"
        })
        await userCollection.findByIdAndUpdate(user.id, { $set: { challenge: options.challenge } })
        return {
            options
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