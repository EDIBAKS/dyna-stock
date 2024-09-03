<template>
    <div class="">
        <nav class="bg-white border-gray-200 dark:bg-gray-900">
    <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
        <a href="https://flowbite.com" class="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="../assets/cropped-DynaLogofromMichelle.png" class="h-12" />
            <div class="flex flex-col">
                <span class="self-center text-2xl font-light whitespace-nowrap text-red-600 dark:text-white">Dynapharm Congo</span>
                <span class="font-bold text-gray-600">Stock Manager</span>
            </div>
          
        </a>
        <div class="flex items-center space-x-6 rtl:space-x-reverse">
           
            <span @click="signOutUser" v-if="user" href="#" class="text-sm text-gray-600 text-bold dark:text-blue-500 cursor-pointer">LogOut</span>
<!--<span v-else href="#" class="text-sm text-blue-600 dark:text-blue-500  cursor-pointer">Login</span>-->

        </div>
    </div>
</nav>
<nav v-if='user' class="bg-gray-50 dark:bg-gray-700">
    <div class="max-w-screen-xl px-4 py-3 mx-auto">
        <div class="flex items-center justify-between">
            <ul class="flex flex-row font-lg font-bold mt-0 space-x-8 rtl:space-x-reverse text-sm">
                <li>
                    <router-link to="/profile">
                        <span class="text-gray-900 dark:text-white" aria-current="page">Home</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/latestdisp">
                        <span class="text-gray-900 dark:text-white">Products</span>
                    </router-link>
                </li>
                <li>
                    <span class="text-gray-900 dark:text-white">Dpc</span>
                </li>
                <li>
                    <router-link to="/logs">
                        <span class="text-gray-900 dark:text-white">Activity</span>
                    </router-link>
                </li>
                <li>
                    <span class="text-gray-900 dark:text-white">Expiries</span>
                </li>
                <li>
                    <router-link to="/report">
                        <span class="text-gray-900 dark:text-white">Summary</span>
                    </router-link>
                </li>
            </ul>
             <!-- Trigger Button -->
             
            <div class="flex flex-col items-end text-sm">
                <span class="text-gray-900 dark:text-white font-bold text-lg">{{userDetails.FirstName}}</span>
                <span class="text-gray-500 dark:text-gray-300 text-sm">{{userDetails.LastName}}</span>
            </div>
        </div>
    </div>
</nav>

    </div>


</template>

<script setup>
import {computed} from 'vue'
import { useAuthStore } from '../stores/authStore';
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const userDetails = computed(() => authStore.userDetails);
import { eventBus } from '../eventbus';

const signOutUser = () => {
  authStore.signOutUser();
  
};



function toggleModal() {
  eventBus.value = !eventBus.value;
}

</script>

<style>

</style>