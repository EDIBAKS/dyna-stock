<template>
    <div>
      <input type="file" @change="handleFileUpload" />
      <button @click="importData">Import to Firebase</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import * as XLSX from 'xlsx';
  import { db } from '../firebase';
  import { writeBatch, doc, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp
  
  const file = ref(null);
  const excelData = ref(null);
  
  const handleFileUpload = (event) => {
    const inputFile = event.target.files[0];
    file.value = inputFile;
  
    if (file.value) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
  
        // Assuming the first sheet is the one you want
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        excelData.value = XLSX.utils.sheet_to_json(worksheet);
      };
      reader.readAsArrayBuffer(file.value);
    }
  };
  
  const importData = async () => {
    if (excelData.value) {
      try {
        const batch = writeBatch(db);
  
        excelData.value.forEach((item) => {
          // Add current timestamp as UpdateDate
          item.dateEntered = serverTimestamp();
  
          const docRef = doc(db, 'productStock', item.id || Math.random().toString(36).substr(2, 9));
          batch.set(docRef, item);
        });
  
        await batch.commit();
        console.log('Data successfully imported to Firebase!');
      } catch (error) {
        console.error('Error importing data to Firebase: ', error);
      }
    } else {
      console.error('No data to import!');
    }
  };
  </script>
  