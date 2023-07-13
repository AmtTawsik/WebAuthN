import { VerifyOTP } from "../../helper/functions"
import { useRealm } from "../../helper/realm"

export default defineEventHandler(async (event)=>{
    const{app,mongo}=useRealm()
    const userCollection=mongo?.db(useRuntimeConfig().public.db).collection('users')
    const tokenCollection=mongo?.db(useRuntimeConfig().public.db).collection('tokens')
    try {
        const {email,token}=await readBody(event)
        let user=await userCollection.findOne({email})
        if(!user){
            setResponseStatus(event,400)
            return{
                error:"user doesn't exist"
            }
        }
        let tokenObject=await tokenCollection.findOne({user:user._id})
        if(Date.now() - new Date(tokenObject.created_at)  > 62500){
            setResponseStatus(event,408)
            return{
                error:"Otp expired"
            }
        }
        const verified=VerifyOTP(tokenObject.secret,token)
        if(!verified){
            setResponseStatus(event,400)
            return {
                error:"Enter a valid token"
            }
        }
        tokenCollection.deleteOne({_id:tokenObject._id})
        return {
            verified,
            message:"good to go"
        }
    } catch (error) {
        console.log(error)
        setResponseStatus(event,500)
        return {
            error:"Server Error!!"
        }
    }
})