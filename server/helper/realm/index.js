import * as Realm from 'realm-web'

export function useRealm() {
    const app = new Realm.App({
        id: useRuntimeConfig().public.appId,
    });
    let mongo = null;
    if (app?.currentUser) {
        mongo = app.currentUser.mongoClient('mongodb-atlas');
    }
    return {
        app,
        Realm,
        mongo,
    };
}

export async function getServerUser(){
    const {app,Realm}=useRealm()
    const credentials=Realm.Credentials.apiKey(useRuntimeConfig().public.serverApiKey)
    const user=await app.logIn(credentials)
    return user
}