import { getServerUser, useRealm } from "../helper/realm"

export default defineEventHandler(async (event)=>{
    try {
        const {app,Realm}=useRealm()
        const {email,deviceId}=await readBody(event)
        console.time()
        const credentials=Realm.Credentials.function({
            email,
            deviceId
        })
        const user=await app.logIn(credentials)
        console.timeEnd()
        return{
            user
        }
    } catch (error) {
        console.log(error)
        setResponseStatus(event,500)
        return { 
            error:"Internal server Erorr"
        }
    }
})