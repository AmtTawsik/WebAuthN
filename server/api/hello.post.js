import { getServerUser, useRealm } from "../helper/realm"

export default defineEventHandler(async (event)=>{
    try {
        const {app,Realm}=useRealm()
        console.time()
        const user=await getServerUser()
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