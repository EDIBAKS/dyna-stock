<template>
    <div id="page-container" class="p-4">
       <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
         <a href="#">
           <h5 @click="toggleMode" class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
             {{ isSignUp ? 'Already registered? Click to login' : 'Click to Register for free' }}
           </h5>
         </a>
         <form @submit.prevent="handleSubmit" class="max-w-sm mx-auto">
           <div v-if="isSignUp" class="mb-5">
             <input type="text" id="fname" class="input-field" placeholder="First Name" required v-model="firstname" />
           </div>
           <div v-if="isSignUp" class="mb-5">
             <input type="text" id="lname" class="input-field" placeholder="Last Name" required v-model="lastname" />
           </div>
           <div v-if="isSignUp" class="mb-5">
             <input type="number" id="telephone" class="input-field" placeholder="Telephone" required v-model="telephone" />
           </div>
           <div v-if="isSignUp" class="mb-5">
             <input type="number" id="contact2" class="input-field" placeholder="Alternative Contact" required v-model="Altelephone" />
           </div>
           <div v-if="isSignUp" class="mb-5">
             <input type="date" id="birthdate" class="input-field" placeholder="Birth Date" required v-model="BirthDate" />
           </div>
           <div v-if="isSignUp" class="mb-5">
             <input type="text" id="address" class="input-field" placeholder="Address" required v-model="adress" />
           </div>
           <div class="mb-5">
             <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
             <input type="email" id="email" class="input-field" placeholder="name@dynacongo.net" required v-model="email" />
           </div>
           <div class="mb-5">
             <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
             <input type="password" id="password" class="input-field" required v-model="password" />
           </div>
           <button type="submit" class="btn-primary w-full sm:w-auto">{{ isSignUp ? 'Sign Up' : 'Login' }}</button>
         </form>
       </div>
     </div>
   </template>
   
   <script setup>
   import { ref } from 'vue';
   import { useAuthStore } from '../stores/authStore';
   
   const authStore = useAuthStore();
   const email = ref('');
   const password = ref('');
   const firstname = ref('');
   const lastname = ref('');
   const telephone = ref('');
   const Altelephone = ref('');
   const adress = ref('');
   const BirthDate = ref('');
   const isSignUp = ref(false);
   
   // Method to toggle between sign-up and sign-in modes
   const toggleMode = () => {
     isSignUp.value = !isSignUp.value;
   };
   
   // Method to handle form submission
   const handleSubmit = () => {
     const currentDateTime = new Date().toISOString();
     if (isSignUp.value) {
       // Register user
       const additionalDetails = {
         FirstName: firstname.value,
         LastName: lastname.value,
         telephone: telephone.value,
         Altelephone: Altelephone.value,
         adress: adress.value,
         BirthDate: BirthDate.value,
         RegisterDate: currentDateTime,
       };
       authStore.register(email.value, password.value, additionalDetails);
     } else {
       // Sign in user
       authStore.signIn(email.value, password.value);
     }
   };
   </script>
   
   <style scoped>
   #page-container {
     
     display: flex;
     justify-content: center;
     align-items: center;
    
     background-color: #f8f9fa;
   }
   
   .input-field {
     background-color: #f8f9fa;
     border: 1px solid #ced4da;
     color: #495057;
     border-radius: 0.25rem;
     padding: 0.5rem 1rem;
     width: 100%;
     margin-bottom: 1rem;
   }
   
   .btn-primary {
     color: #fff;
     background-color: #007bff;
     border-color: #007bff;
     border-radius: 0.25rem;
     padding: 0.5rem 1rem;
     cursor: pointer;
   }
   
   .btn-primary:hover {
     background-color: #0056b3;
     border-color: #0056b3;
   }
   </style>
   