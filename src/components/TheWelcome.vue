<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg w-full">
    <div class="flex flex-col ml-5">
  <div class="flex items-center">
    <q-icon name="schedule" size="20px" />
   
    <strong class="mr-8">{{ currentTimestamp }}</strong>
    
    <div   @click="showDialog = true" class="text-gray-600 cursor-pointer mx-auto" ><q-icon name="note_add" size="35px"/>Add Dispatch</div>
      <div @click="exportToExcel" class="text-green-600 cursor-pointer mx-auto" ><q-img src="../assets/xls-icon-3392.png" width="30px" height="30px"/>Export Excel</div>
      
      <div @click="exportToPDF" class="text-red-600 cursor-pointer mx-auto" ><q-img src="../assets/pdf-remove.png" width="30px" height="30px"/>Export PDF</div>
      <div @click="exportToPDF" class="text-gray-600 cursor-pointer mx-auto" ><q-icon name="print" size="35px"/>Print</div>
  </div>
 
</div>
    <table class="w-full  text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 m-4">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">
            Product name
          </th>
          <th scope="col" class="px-6 py-3">
            Total Stock
          </th>
          <th v-for="shop in shops" :key="shop.shopCode" scope="col" class="px-6 py-3">
            {{ shop.shopCode }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products"
          :key="product.productCode"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-blue-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
        >
          <td class="px-6 py-4">{{ product.productName }}</td>
          <td class="px-6 py-4">{{ product.totalQty }}</td>
          <td
            v-for="shop in shops"
            :key="`${product.productCode}-${shop.shopCode}`"
            class="px-6 py-4"
          >
            {{ getDispatchQuantity(product.productCode, shop.shopCode) || 0 }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-left ml-5 space-x-2 mt-4">
     
   
      
      <div>
 <!-- Export Buttons -->
 <div class="flex justify-end space-x-2 mt-4">
     
      
    </div>

      </div>

      <!-- Popup Dialog -->
      <div
        v-if="showDialog"
        id="popup-modal"
        tabindex="-1"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 pt-10"
      
      >
        <div class="relative w-full max-w-2xl h-full md:h-auto">
          <!-- Modal Content -->
          <div class="relative bg-white bg-opacity-75 backdrop-blur-lg rounded-lg shadow dark:bg-gray-700 dark:bg-opacity-75">

            <!-- Modal Header -->
            <div
              class="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600"
            >
              <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                Add  Dispatch
              </h3>
              <button
                @click="closeDialog"
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <!-- Modal Body -->
            <div class="p-6 space-y-6">
              <label for="options">Choose a shop:</label>
              <select
                v-model="form.selectedShop"
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option selected>select a shop</option>
                <option
                  v-for="shop in shops"
                  :key="shop.shopCode"
                  :value="shop.shopCode"
                >
                  {{ shop.shopName }}
                </option>
              </select>




              <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                    Product name
                </th>
                <th scope="col" class="px-6 py-3">
                    quantity
                </th>
                <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                    actions
                </th>
              
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in form.items"
            :key="index" class="border-b border-gray-200 dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800">
                  <select
                        v-model="item.productCode"
                        class="block w-15 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option selected>select a product</option>
                        <option
                          v-for="product in products"
                          :key="product.productCode"
                          :value="product.productCode"
                          
                        >
                          {{ product.productName }}
                        </option>
                      </select>
                </th>
                <td class="px-6 py-4">
                  <input
                        type="number"
                        v-model.number="item.quantity"
                        id="small-input"
                        class="block w-20 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="1"
                      step="1"
                      
                      />
                </td>
                <td class="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                  <div
                        @click="removeItem(index)"
                        class="flex items-center justify-center h-full cursor-pointer"
                      >
                        <svg
                          class="w-6 h-6 text-red-600 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                          />
                        </svg>
                        <span class="font-bold text-red-600">delete</span>
                      </div>
                </td>
               
            </tr>
 
           
           
        </tbody>
    </table>
</div>






            
              <div @click="addItem" class="cursor-pointer flex">
                <svg
                  class="w-6 h-6 text-blue-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="font-bold text-blue-800">Add Item</span>
              </div>
            </div>
            <!-- Modal Footer -->
            <div
              class="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
            >
              <button
                @click="closeDialog"
                type="button"
                class="text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancel
              </button>
              <button
                @click="confirmAction"
                type="button"
                class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  

</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable';
import { eventBus } from '../eventbus';

const currentTimestamp = ref('');
const showDialog = ref(false);
const validationMessages = ref({});
const sortKey = ref(''); // Key to sort by
const sortOrder = ref('asc'); // Sort order: 'asc' or 'desc'

// Form state
const form = reactive({
  selectedShop: '',
  items: [{ productCode: '', quantity: 1 }],
  Status: 'New Order',
  date: Timestamp.now(),
});

// Data collections
const products = ref([]);
const shops = ref([]);
const dispatches = ref([]);

// Fetch data on component mount
onMounted(async () => {
  eventBus.value = showDialog.value;

  // Fetch shops data
  const shopsResult = await getDocs(collection(db, 'SHOPS'));
  shopsResult.forEach((doc) => {
    let shp = doc.data();
    shp.id = doc.id;
    shops.value.push(shp);
  });

  // Fetch products data
  const productsResult = await getDocs(collection(db, 'productStock'));
  productsResult.forEach((doc) => {
    let prdt = doc.data();
    prdt.id = doc.id;
    products.value.push(prdt);
  });

  // Fetch dispatches data
  const dispatchResult = await getDocs(collection(db, 'dispatches'));
  dispatchResult.forEach((doc) => {
    dispatches.value.push(doc.data());
  });

  // Show current timestamp
  showCurrentTimestamp();
});

// Function to get and format the current timestamp
const showCurrentTimestamp = () => {
  const now = new Date();
  currentTimestamp.value = now.toLocaleString(); // Format as 'MM/DD/YYYY, HH:MM:SS AM/PM'
};

// Function to get dispatch quantity for a specific product and shop
const getDispatchQuantity = (productCode, shopCode) => {
  let quantity = 0;
  dispatches.value.forEach((dispatch) => {
    if (dispatch.selectedShop === shopCode) {
      const item = dispatch.items.find(i => i.productCode === productCode);
      if (item) {
        quantity += item.quantity;
      }
    }
  });
  return quantity;
};

// Function to add a new item to the items array
const addItem = () => {
  form.items.push({ productCode: '', quantity: 1 });
};

// Function to remove an item from the items array
const removeItem = (index) => {
  form.items.splice(index, 1);
};

// Function to close the dialog
const closeDialog = () => {
  showDialog.value = false;
};

// Function to confirm the action and submit the order
const confirmAction = async () => {
  await handleDispatch();
};

// Function to reset the form
const resetForm = () => {
  form.selectedShop = '';
  form.items = [{ productCode: '', quantity: 1 }];
};

// Function to handle the dispatch (submit the order)
const handleDispatch = async () => {
  const errors = validateForm();

  if (errors.length > 0) {
    showValidationErrors(errors);
    return;
  }

  try {
    await processDispatch();
    closeDialog();
    resetForm();
  } catch (error) {
    console.error('Error handling dispatch:', error);
    showToast('Error handling dispatch. Please try again.', 'red');
  }
};

// Function to validate the form
const validateForm = () => {
  const errors = [];

  if (!form.selectedShop) {
    errors.push('Please select a shop.');
  }

  form.items.forEach(item => {
    if (!item.productCode) {
      errors.push('One or more items are missing a product code.');
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || isNaN(item.quantity)) {
      errors.push(`Invalid quantity for product ${item.productCode}. Please enter a valid number greater than zero.`);
    }
  });

  return errors;
};

// Function to show validation errors using Toastify
const showValidationErrors = (errors) => {
  errors.forEach(error => {
    showToast(error, 'red');
  });
};

// Function to process the dispatch
const processDispatch = async () => {
  const productStockSnapshot = await getDocs(collection(db, 'productStock'));

  const productStockMap = {};
  productStockSnapshot.forEach((doc) => {
    const productData = doc.data();
    const productCode = productData.productCode;
    productStockMap[productCode] = {
      totalQty: productData.totalQty,
      docId: doc.id,
    };
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let dispatchItems = [];
  let allItemsAvailable = true;

  for (const item of form.items) {
    const productData = productStockMap[item.productCode];
    if (productData) {
      const newStockQuantity = productData.totalQty - item.quantity;

      if (newStockQuantity >= 0) {
        dispatchItems.push(item);
        await updateProductStock(productData.docId, newStockQuantity);
      } else {
        showToast(`Insufficient stock for product ${item.productCode}.`, 'red');
        allItemsAvailable = false;
        break;
      }
    }
  }

  if (allItemsAvailable && dispatchItems.length > 0) {
    await saveDispatch(dispatchItems);
  }
};

// Function to update product stock
const updateProductStock = async (docId, newStockQuantity) => {
  const productStockRef = doc(db, 'productStock', docId);
  await updateDoc(productStockRef, { totalQty: newStockQuantity });

  const productToUpdate = products.value.find(p => p.productCode === docId);
  if (productToUpdate) {
    productToUpdate.totalQty = newStockQuantity;
  }
};

// Function to save the dispatch to Firestore
const saveDispatch = async (dispatchItems) => {
  const existingDispatch = await findExistingDispatch();
  if (existingDispatch) {
    existingDispatch.items = existingDispatch.items.concat(dispatchItems);
    await updateDoc(doc(db, 'dispatches', existingDispatch.id), existingDispatch);
  } else {
    const newDispatch = {
      selectedShop: form.selectedShop,
      items: dispatchItems,
      date: form.date,
      Status: form.Status,
    };
    const docRef = await addDoc(collection(db, 'dispatches'), newDispatch);
    dispatches.value.push({ ...newDispatch, id: docRef.id });
  }

  await addDoc(collection(db, 'dispatchLogs'), {
    items: dispatchItems,
    shopCode: form.selectedShop,
    date: Timestamp.now(),
    description: `New Dispatch with ${dispatchItems.length} items.`,
  });

  showToast('Product Dispatch Successful', 'green');
};

// Function to find existing dispatch for the current month
const findExistingDispatch = async () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const existingDispatchSnapshot = await getDocs(collection(db, 'dispatches'));
  let existingDispatch = null;

  existingDispatchSnapshot.forEach((doc) => {
    const dispatchData = doc.data();
    const dispatchDate = dispatchData.date.toDate();

    if (
      dispatchData.selectedShop === form.selectedShop &&
      dispatchDate.getMonth() === currentMonth &&
      dispatchDate.getFullYear() === currentYear
    ) {
      existingDispatch = { ...dispatchData, id: doc.id };
    }
  });

  return existingDispatch;
};

// Function to show toast notifications
const showToast = (message, color) => {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: "top", 
    position: "right",
    backgroundColor: color,
  }).showToast();
};

// Computed property for sorted products
const sortedProducts = computed(() => {
  if (sortKey.value) {
    return [...products.value].sort((a, b) => {
      let comparison = 0;
      if (a[sortKey.value] > b[sortKey.value]) {
        comparison = 1;
      } else if (a[sortKey.value] < b[sortKey.value]) {
        comparison = -1;
      }
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  }
  return products.value;
});

// Function to sort the products based on a given key
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

// Export data to Excel
const exportToExcel = () => {
  const timestamp = new Date().toLocaleString();
  const title = 'Dynapharm Barzza';
  const address = '221 Bis Av Nelson Mandela,Centre Ville, Brazza';

  const data = [];
  data.push([title]);
  data.push([address]);
  data.push([`Report generated at ${timestamp}`]);
  data.push([]);
  data.push(['Product Name', 'Total Dispatch', 'Total Sales', 'Closing Stock', 'Stock Value']);

  sortedProducts.value.forEach((product) => {
    const row = [
      product.productName,
      product.totalDispatch,
      product.totalSales,
      product.balanceStock,
      product.stockValue,
    ];
    data.push(row);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `Report_${timestamp}.xlsx`);
};

// Export data to PDF
const exportToPDF = () => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();
  const title = 'Dynapharm Barzza';
  const address = '221 Bis Av Nelson Mandela,Centre Ville, Brazza';

  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(10);
  doc.text(address, 20, 30);
  doc.text(`Report generated at ${timestamp}`, 20, 40);

  const headers = ['Product Name', 'Total Dispatch', 'Total Sales', 'Closing Stock', 'Stock Value'];
  const data = sortedProducts.value.map(product => [
    product.productName,
    product.totalDispatch,
    product.totalSales,
    product.balanceStock,
    product.stockValue,
  ]);

  doc.autoTable({
    startY: 50,
    head: [headers],
    body: data,
  });

  doc.save(`Report_${timestamp}.pdf`);
};

</script>
