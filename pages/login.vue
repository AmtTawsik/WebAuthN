<template>
    <section class="bg-gray-50 dark:bg-gray-900">
        <h1 class="text-4xl text-center">Now Try to authenticate</h1>
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div
                class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Sign in to your account
                    </h1>
                    <form class="space-y-4 md:space-y-6" @submit.prevent="authenticateUser">
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your
                                Email</label>
                            <input type="email" name="email" id="email" v-model="email"
                                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="name@company.com" required="" />
                        </div>
                        <button type="submit"
                            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            <Spinner v-if="isLoading" class="inline-block mx-auto" />
                            <span v-else class="py-0.5">
                                Sign In
                            </span>
                        </button>
                        <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                            Don’t have an account yet?
                            <NuxtLink to="/"
                                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</NuxtLink>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import {startAuthentication} from '@simplewebauthn/browser'

const {app,Realm}=useRealm()
const email=ref('')
const isLoading=ref(false)

async function authenticateUser(){
    try {
        toggleLoading()
        const deviceId=localStorage.getItem(email.value)
        const mac=navigator.platform.indexOf('Mac') !==-1
        if(!deviceId && !mac){
            toggleLoading()
            navigateTo('/register-device')
            return
        }
        const {data}=await useFetch('/api/authenticate/generate-authentication-options',{
            method:"POST",
            body:{
                email:email.value,
                deviceId,
                mac
            }
        })
        toggleLoading()
        const attResp=await startAuthentication({
            ...data.value
        })
        toggleLoading()
        const {data:finalResp}=await useFetch('/api/authenticate/verify-authentication-options',{
            method:"POST",
            body:{
                authenticationBody:attResp,
                email:email.value
            }
        })
        if(finalResp.value.verified){
            const credentials=Realm.Credentials.function({
                email:email.value,
                deviceId,
            })
            const user=await app.logIn(credentials)
            console.log(user)
            toggleLoading()
            navigateTo('/login-success')
        }
    } catch (error) {
        console.log(error)
    }
}


function toggleLoading(){
    isLoading.value=!isLoading.value
}
</script>
