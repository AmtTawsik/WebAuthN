// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: false },
  runtimeConfig:{
    public:{
      appId:'',
      serverApiKey:'',
      rpId:'',
      rpName:'',
      rpProtocol:''
    }
  }
})
