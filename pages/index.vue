<template>
    <section class="bg-gray-50 dark:bg-gray-900">
        <h1 class="text-4xl text-center">Now First Register</h1>
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div
                class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Create and account
                    </h1>
                    <form class="space-y-4" id="registration" @submit.prevent="()=>{
                        if(otpSented){
                            registerWebAuthn()
                        }
                        else{
                            registerUser()
                        }
                    }">
                        <div class="flex flex-col gap-1">
                            <label for="email"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input type="email" name="email" v-model="email" id="email"
                                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 p focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="JackRyan@gmail.com" required="" />
                            <span id="user-exists" class="invisible text-sm text-red-500">this user already exists</span>
                        </div>
                        <div>
                            <label for="Phone" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" name="name" id="Phone" v-model="name"
                                class="bg-gray-50 border border-gray-300 no-appearence text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required="" />
                        </div>
                        <div :class="{'hidden':!otpSented}" id="OTPSection">
                            <label for="token"
                                class="block mb-2 text-base font-medium text-gray-900 h-inherit dark:text-white">Enter your
                                otp</label>
                            <input type="number" id="token" minlength="0" maxlength="6" v-model="token"
                                class="bg-gray-50 border border-gray-300 no-appearence  text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600  focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        </div>
                        <button type="submit"
                            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            <Spinner v-if="isLoading" class="inline-block mx-auto" />
                            <span v-else class="py-0.5">
                                Register
                            </span>
                        </button>
                        <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                            Already have an account?
                            <NuxtLink to="/login"
                                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</NuxtLink>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import {startRegistration} from '@simplewebauthn/browser'

const otpSented=ref(false)
const token=ref('')
const email=ref('')
const name=ref('')
const isLoading=ref(false)
async function registerUser(){
    try {
        toggleLoading()
        const {data,success}=await useFetch('/api/register',{
            method:"POST",
            body:{
                email:email.value,
                name:name.value
            }
        })
        console.log(success)
        toggleLoading()
        otpSented.value=true
    } catch (error) {
        console.log(error)
    }
}

async function registerWebAuthn(){
    try {
        toggleLoading()
        await useFetch('/api/authenticate/token-authenticate',{
            method:"POST",
            body:{
                email:email.value,
                token:parseInt(token.value)
            }
        })
        const {data}=await useFetch('/api/register/generate-registration-option',{
            method:"POST",
            body:{
                email:email.value
            }
        })
        toggleLoading()
        const attResp=await startRegistration({
            ...data.value
        })
        toggleLoading()
        const {data:finalResp}=await useFetch('/api/register/verify-registrion-option',{
            method:'POST',
            body:{
                registrationBody:attResp,
                email:email.value
            }
        })
        if(finalResp.value.success){
            toggleLoading()
            localStorage.setItem(email.value,finalResp.value.deviceId)
            navigateTo('/register-success')
        }
    } catch (error) {
        console.log(error)
    }
}
function toggleLoading(){
    isLoading.value=!isLoading.value
}
</script>
