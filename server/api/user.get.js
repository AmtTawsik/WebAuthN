import { useRealm } from "../../composables/realm"
export default defineEventHandler(async (event)=>{
    const {app,Realm,mongo}=useRealm()
    const userCollections=mongo?.db('webauthn').collection('users')
    const user=await userCollections.findOneAndUpdate({email:'iamsoumo26@gmail.com'},{$unset:{challenge:""}},{returnNewDocument:true})
    console.log(user)
    return {
        user:app?.currentUser
    }
})