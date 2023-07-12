import { uint8Tobase64url } from "../../helper/functions"
import { useRealm } from "../../helper/realm"
import { verifyRegistrationResponse } from "@simplewebauthn/server"
import {ObjectId} from 'bson'

export default defineEventHandler(async (event) => {
    const { mongo } = useRealm()
    const userCollection = mongo?.db('webauthn').collection('users')
    try {
        const { registrationBody: body, email } = await readBody(event)
        const user = await userCollection.findOne({ email })
        if (!user) {
            setResponseStatus(event, 400)
            return {
                error: "user doesn't exist"
            }
        }
        const { challenge: expectedChallenge } = user
        let verification
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: `${useRuntimeConfig().public.rpProtocol}://${useRuntimeConfig().public.rpId}`,
            expectedRPID: useRuntimeConfig().public.rpId
        })
        const { verified, registrationInfo } = verification
        if (!verified) {
            return res.status(401).json({ error: "Invalid credentials" })
        }
        const { credentialID, counter, credentialPublicKey } = registrationInfo
        const data = {
            user: {
                id: user.id
            }
        }
        const newDevice = await userCollection.findOneAndUpdate({ _id: user._id }, {
            $set: { challenge: "" },
            $push: {
                devices: {
                    _id:new ObjectId(),
                    credentialID: uint8Tobase64url(credentialID),
                    counter,
                    PublicKey: uint8Tobase64url(credentialPublicKey)
                }
            }
        }, { returnNewDocument: true })
        const {_id:deviceId}=newDevice.devices.at(-1)
        return {
            success:true,
            deviceId:deviceId.toString()
        }
    } catch (error) {
        console.log(error)
        setResponseStatus(event,500)
        return {
            error:"Server Error!!"
        }
    }
})