import { verifyAuthenticationResponse } from "@simplewebauthn/server"
import { useRealm } from "../../helper/realm"
import { base64urlToUint8 } from "../../helper/functions"

export default defineEventHandler(async (event) => {
    const { mongo } = useRealm()
    const userCollection = mongo?.db('webauthn').collection('users')
    try {
        const { authenticationBody: body, email } = await readBody(event)
        const user = await userCollection.findOne({ email })
        if (!user) {
            setResponseStatus(event, 400)
            return {
                error: "user doesn't exist"
            }
        }
        const { challenge: expectedChallenge } = user
        const authenticator = user.devices.find(device => device.credentialID === body.id)
        if (!authenticator) {
            setResponseStatus(event, 401)
            return {
                error: "No authenticator found"
            }
        }
        let verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: useRuntimeConfig().public.origin,
            expectedRPID: useRuntimeConfig().public.rpId,
            authenticator: {
                ...authenticator,
                credentialID: base64urlToUint8(authenticator.credentialID),
                credentialPublicKey: base64urlToUint8(authenticator.PublicKey)
            }
        })
        const { verified, authenticationInfo } = verification
        if (!verified) {
            setResponseStatus(event, 401)
            return {
                error: "Unauthrized user"
            }
        }
        const data = {
            user: {
                id: user._id
            }
        }
        const { newCounter } = authenticationInfo
        await userCollection.findOneAndUpdate({_id:user._id}, { $set: { challenge: "" } })
        await userCollection.findOneAndUpdate({ _id: user._id, "devices._id": authenticator._id }, { $set: { "devices.$.counter": newCounter } })
        return{
            verified,
            status:"success"
        }
    }
    catch (error) {
        console.log(error)
    }
})