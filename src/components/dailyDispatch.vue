<template>
  <div class="container mx-auto p-4">
    <!-- Date Pickers for Selecting Date Range -->
    <div class="flex items-center space-x-4 p-4 bg-gray-300 rounded-lg">
      <label>Select a Shop</label>
      <select
                v-model="selectedShop"
                class="block  p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      <label>From:</label>
      <input
        type="date"
        v-model="startDate"
        class="block p-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <label>To:</label>
      <input
        type="date"
        v-model="endDate"
        class="block p-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <button @click="fetchDispatchLogs" class="bg-blue-500 text-white p-2 rounded-lg">Search</button>
    </div>

     <!-- Display Message if No Records Found -->
     <div v-if="filteredDispatchLogs.length === 0" class="mt-4 text-red-500">
      No records found for the selected dates.
    </div>

    <!-- Table to Display Dispatch Logs -->
    <div class="relative overflow-x-auto mt-4">
      <table class="w-full text-sm text-left text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
        <thead class="text-xs text-gray-700 uppercase bg-gray-300">
          <tr>
            <th scope="col" class="px-6 py-3">DATE</th>
            <th scope="col" class="px-6 py-3">SHOP</th>
            <th scope="col" class="px-6 py-3">ITEMS</th>
            <th scope="col" class="px-6 py-3">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredDispatchLogs" :key="log.id" class="bg-white border-b">
            <td class="px-6 py-4 font-medium text-gray-900">{{ new Date(log.date.toDate()).toLocaleString() }}</td>
            <td class="px-6 py-4 text-blue-600">{{ log.selectedShop }}</td>
            <td class="px-6 py-4">
              <table class="w-full text-gray-500">
    <thead>
      <tr>
        <th class="px-4 py-2 text-left border-b">Product</th>
        <th class="px-4 py-2 text-left border-b">Quantity</th>
        <th class="px-4 py-2 text-left border-b">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in log.items" :key="item.productCode" class="border-b">
        <td class="px-4 py-2 flex items-center" style="width: 200px;">
          <svg class="w-4 h-4 text-green-500 me-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
          {{ getProductName(item.productCode) }}
        </td>
        <td class="px-4 py-2">
          <input
            v-model.number="item.quantity"
            type="number"
            class="block w-16 p-1 text-center text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
            min="1"
            step="1"
          />
        </td>
        <td class="px-2 py-1 flex gap-1 items-center">
          <q-btn @click="editItemQuantityAndUpdateStock(log.id,item.productCode,item.quantity)" flat style="color: blue" label="SAVE"  />
          <q-btn @click="deleteItemFromDispatch(log.id, item.productCode)" flat style="color: red" label="REMOVE"  />
        </td>
      </tr>
    </tbody>
  </table>
            </td>
            <td class="px-6 py-4">
              <button @click="deleteEntireDispatch(log.id)" class="text-red-600">REMOVE ALL</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import { doc,addDoc,collection,query,where,getDoc,getDocs, updateDoc, deleteDoc,Timestamp,serverTimestamp,arrayRemove} from 'firebase/firestore';
import { db } from '../firebase';
// State for date selection and results
const startDate = ref('');
const endDate = ref('');
const dispatchLogs = ref([]);
const products = ref([]);
const shops = ref([]);
const selectedShop=ref('')
import { Dialog, Notify } from 'quasar';
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'
// Computed property to filter dispatch logs based on date range
//const filteredDispatchLogs = computed(() => {
 // if (!startDate.value || !endDate.value) {
    // Return logs of the current month by default
  //  const now = new Date();
   // const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
   // return dispatchLogs.value.filter(log =>
   //   log.date.toDate() >= firstDayOfMonth && log.date.toDate() <= now
  //  );
 // }

//const start = new Date(startDate.value);
 // const end = new Date(endDate.value);

 // return dispatchLogs.value.filter(log =>
 //   log.date.toDate() >= start && log.date.toDate() <= end
 // );
//});

const filteredDispatchLogs = computed(() => {
  // Check if the start and end dates are selected
  const startDateValue = startDate.value;
  const endDateValue = endDate.value;
  const selectedShopValue = selectedShop.value; // Assuming `selectedShop` is a ref holding the selected shop

  let filteredLogs = dispatchLogs.value;

  // Filter by shop if selected
  if (selectedShopValue) {
    filteredLogs = filteredLogs.filter(log => log.selectedShop === selectedShopValue);
  }

  // Filter by date range
  if (startDateValue && endDateValue) {
    const start = new Date(startDateValue);
    const end = new Date(endDateValue);
    filteredLogs = filteredLogs.filter(log =>
      log.date.toDate() >= start && log.date.toDate() <= end
    );
  } else {
    // If no dates selected, return logs for the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredLogs = filteredLogs.filter(log =>
      log.date.toDate() >= firstDayOfMonth && log.date.toDate() <= now
    );
  }

  return filteredLogs;
});



// Function to fetch dispatch logs based on date range
const fetchDispatchLogs = async () => {
  const now = new Date();
  let startTimestamp, endTimestamp;

  if (!startDate.value || !endDate.value) {
    // Set default to the current month if dates are not provided
    startTimestamp = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
    endTimestamp = Timestamp.fromDate(now);
  } else {
    startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    endTimestamp = Timestamp.fromDate(new Date(endDate.value));
  }

  const dispatchLogQuery = query(
    collection(db, 'dispatches'),
    where('date', '>=', startTimestamp),
    where('date', '<=', endTimestamp)
  );

  const querySnapshot = await getDocs(dispatchLogQuery);
  dispatchLogs.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
const getProductName = (productCode) => {
  const product = products.value.find(p => p.productCode === productCode);
  return product ? product.productName : productCode;
};
onMounted(async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    products.value = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    await fetchDispatchLogs();
  } catch (error) {
    console.error('Error fetching products:', error);
  }
  const result = await getDocs(collection(db, 'SHOPS'));
  result.forEach((doc) => {
    let shp = doc.data();
    shp.id = doc.id;
    shops.value.push(shp);
  });



});

async function editItemQuantitys(dispatchId, productCode, newQuantity) {
  const dispatchRef = doc(db, "dispatches", dispatchId);
  const productStockRef = doc(db, "productStock", productCode);

  try {
    // Get the current dispatch document
    const dispatchDoc = await getDoc(dispatchRef);
    if (dispatchDoc.exists()) {
      const dispatchData = dispatchDoc.data();

      // Find the item in the dispatch's items array
      const item = dispatchData.items.find(i => i.productCode === productCode);
      if (item) {
        const oldQuantity = item.quantity;
        const quantityDifference = newQuantity - oldQuantity;

        console.log(`Old Quantity: ${oldQuantity}, New Quantity: ${newQuantity}`);
        console.log(`Quantity Difference: ${quantityDifference}`);

        // Update the item's quantity in the dispatch
        await updateDoc(dispatchRef, {
          "items": dispatchData.items.map(i =>
            i.productCode === productCode ? { ...i, quantity: newQuantity } : i
          )
        });
 // Update the productStock totalQty based on the quantity difference
        //const productStockDoc = await getDoc(productStockRef);
        //if (productStockDoc.exists()) {
         // const currentTotalQty = productStockDoc.data().totalQty;
         // const updatedTotalQty = currentTotalQty - quantityDifference;

          // Update the totalQty in productStock
         // await updateDoc(productStockRef, {
         //   totalQty: updatedTotalQty
        //  });
       // }

        // Fetch the updated dispatches (if you have a function to reload dispatches, call it here)
        await updateproductStock()
        await fetchDispatchLogs();
        console.log("Dispatch updated and dispatches reloaded.");
      } else {
        console.log("Item not found in the dispatch.");
      }
    } else {
      console.log("Dispatch not found.");
    }
  } catch (error) {
    console.error("Error editing item quantity: ", error);
  }
}

//edit a quantity of an item in the dispatch
async function editItemQuantityAndUpdateStock(dispatchId, productCode, newQuantity) {
  const dispatchRef = doc(db, "dispatches", dispatchId);

  try {
    // Create a map of productStock for quick lookup
    const productStockSnapshot = await getDocs(collection(db, 'productStock'));
    const productStockMap = {};

    productStockSnapshot.forEach((doc) => {
      const productData = doc.data();
      productStockMap[productData.productCode] = {
        totalQty: productData.totalQty,
        docId: doc.id,
      };
    });

    // Get the current dispatch document
    const dispatchDoc = await getDoc(dispatchRef);
    if (dispatchDoc.exists()) {
      const dispatchData = dispatchDoc.data();

      // Find the item in the dispatch's items array
      const item = dispatchData.items.find(i => i.productCode === productCode);
      if (item) {
        const oldQuantity = item.quantity;
        const quantityDifference = newQuantity - oldQuantity;

        console.log(`Old Quantity: ${oldQuantity}, New Quantity: ${newQuantity}`);
        console.log(`Quantity Difference: ${quantityDifference}`);

        // Update the item's quantity in the dispatch
        await updateDoc(dispatchRef, {
          "items": dispatchData.items.map(i =>
            i.productCode === productCode ? { ...i, quantity: newQuantity } : i
          )
        });

        // Check if the product exists in productStock
        const productData = productStockMap[productCode];
        if (productData) {
          const currentTotalQty = productData.totalQty;
          const updatedTotalQty = currentTotalQty - quantityDifference;

          // Update the totalQty in productStock
          const productStockRef = doc(db, 'productStock', productData.docId);
          await updateDoc(productStockRef, {
            totalQty: updatedTotalQty
          });

          console.log(`Updated stock for ${productCode}. New totalQty: ${updatedTotalQty}`);

          // Add a log entry into dispatchLogs
          await addDoc(collection(db, 'dispatchLogs'), {
            productCode: productCode,
            oldQuantity: oldQuantity,
            newQuantity: newQuantity,
            quantityDifference: quantityDifference,
            shopCode: dispatchData.selectedShop,
            date: Timestamp.now(),
            description: `Quantity updated for product ${productCode} in dispatch ${dispatchId}.`,
          });

          console.log(`Log added to dispatchLogs for product ${productCode}.`);

          // Show Toastify notification for successful update
          Toastify({
            text: `Quantity for product ${productCode} in dispatch ${dispatchId} updated successfully.`,
            duration: 3000,
            close: true,
            gravity: "top", 
            position: "right",
            backgroundColor: "green",
          }).showToast();
        } else {
          console.log(`Product with code ${productCode} not found in productStock.`);
        }

        // Fetch the updated dispatches (if you have a function to reload dispatches, call it here)
        await fetchDispatchLogs();
        console.log("Dispatch updated and dispatches reloaded.");
      } else {
        console.log("Item not found in the dispatch.");

        // Show Toastify notification for item not found
        Toastify({
          text: `Item with product code ${productCode} not found in dispatch ${dispatchId}.`,
          duration: 3000,
          close: true,
          gravity: "top", 
          position: "right",
          backgroundColor: "orange",
        }).showToast();
      }
    } else {
      console.log("Dispatch not found.");

      // Show Toastify notification for dispatch not found
      Toastify({
        text: `Dispatch with ID ${dispatchId} not found.`,
        duration: 3000,
        close: true,
        gravity: "top", 
        position: "right",
        backgroundColor: "red",
      }).showToast();
    }
  } catch (error) {
    console.error("Error editing item quantity: ", error);

    // Show Toastify notification for error
    Toastify({
      text: `Error updating quantity for product ${productCode} in dispatch ${dispatchId}.`,
      duration: 3000,
      close: true,
      gravity: "top", 
      position: "right",
      backgroundColor: "red",
    }).showToast();
  }
}


//Delete an item from a dispatch
async function deleteItemFromDispatch(dispatchId, productCode) {
  const dispatchRef = doc(db, "dispatches", dispatchId);
  const dispatchLogsRef = collection(db, "dispatchLogs");

  try {
    // Create a map of productStock for quick lookup
    const productStockSnapshot = await getDocs(collection(db, 'productStock'));
    const productStockMap = {};

    productStockSnapshot.forEach((doc) => {
      const productData = doc.data();
      productStockMap[productData.productCode] = {
        totalQty: productData.totalQty,
        docId: doc.id,
      };
    });

    // Check if the product exists in the map
    if (!(productCode in productStockMap)) {
      throw new Error(`Product with code ${productCode} not found in product stock.`);
    }

    // Get the current dispatch document
    const dispatchDoc = await getDoc(dispatchRef);
    if (dispatchDoc.exists()) {
      const dispatchData = dispatchDoc.data();

      // Find the item in the dispatch's items array
      const item = dispatchData.items.find(i => i.productCode === productCode);
      if (item) {
        const itemQuantity = item.quantity;

        // Update the totalQty in productStock by adding the quantity of the deleted item
        const productStockDocId = productStockMap[productCode].docId;
        const productStockRef = doc(db, 'productStock', productStockDocId);
        const updatedTotalQty = productStockMap[productCode].totalQty + itemQuantity;

        await updateDoc(productStockRef, {
          totalQty: updatedTotalQty
        });

        // Remove the item from the dispatch
        const updatedItems = dispatchData.items.filter(i => i.productCode !== productCode);
        await updateDoc(dispatchRef, {
          items: updatedItems
        });

        // If the items array is now empty, delete the entire dispatch document
        if (updatedItems.length === 0) {
          await deleteDoc(dispatchRef);
          console.log("Dispatch deleted as no items remain.");

          // Show Toastify notification for dispatch deletion
          Toastify({
            text: `Dispatch ${dispatchId} deleted as no items remain.`,
            duration: 3000,
            close: true,
            gravity: "top", 
            position: "right",
            backgroundColor: "blue",
          }).showToast();
        } else {
          console.log("Item removed, but other items still remain in the dispatch.");

          // Show Toastify notification for item removal
          Toastify({
            text: `Item ${productCode} removed from dispatch ${dispatchId}.`,
            duration: 4500,
            close: true,
            gravity: "top", 
            position: "right",
            backgroundColor: "green",
          }).showToast();
        }

        // Create a log in dispatchLogs to capture the details of the operation
        await addDoc(dispatchLogsRef, {
          dispatchId: dispatchId,
          productCode: productCode,
          operation: "delete",
          quantity: itemQuantity,
          timestamp: serverTimestamp(),
          description: `Deleted ${itemQuantity} of ${productCode} from dispatch ${dispatchId}.`
        });

        // Optionally, fetch dispatch logs or any other necessary updates
        await fetchDispatchLogs();
      }
    }
  } catch (error) {
    console.error("Error deleting item from dispatch: ", error);

    // Show Toastify notification for error
    Toastify({
      text: `Error deleting item ${productCode} from dispatch ${dispatchId}.`,
      duration: 3000,
      close: true,
      gravity: "top", 
      position: "right",
      backgroundColor: "red",
    }).showToast();
  }
}


async function confirmAndDeleteDispatch(dispatchId) {
      try {
        const confirmed = Dialog.create({
          title: 'Confirm Deletion',
          message: `Are you sure you want to delete this dispatch? This action cannot be undone.`,
          cancel: true,
          persistent: true,
        }).onOk(() => true)
          .onCancel(() => false)
          .onDismiss(() => false);

        // Proceed with deletion only if the user confirms
        if (confirmed) {
          await this.deleteEntireDispatch(dispatchId);
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Deletion canceled',
          });
        }
      } catch (error) {
        console.error('Error in confirmation:', error);
      }
    }
async function deleteEntireDispatch(dispatchId) {
  try {
  
    const dispatchRef = doc(db, "dispatches", dispatchId);
    const dispatchLogsRef = collection(db, "dispatchLogs");

    // Fetch the dispatch document
    const dispatchDoc = await getDoc(dispatchRef);
    if (!dispatchDoc.exists()) {
      throw new Error(`Dispatch with ID ${dispatchId} does not exist.`);
    }

    const dispatchData = dispatchDoc.data();
    const items = dispatchData.items;

    // Create a map of productStock for quick lookup
    const productStockSnapshot = await getDocs(collection(db, 'productStock'));
    const productStockMap = {};

    productStockSnapshot.forEach((doc) => {
      const productData = doc.data();
      productStockMap[productData.productCode] = {
        totalQty: productData.totalQty,
        docId: doc.id,
      };
    });

    // Update totalQty in productStock for each product in the dispatch
    for (const item of items) {
      const productCode = item.productCode;
      const itemQuantity = item.quantity;

      // Ensure the product exists in the productStockMap
      if (productCode in productStockMap) {
        const productStockDocId = productStockMap[productCode].docId;
        const productStockRef = doc(db, 'productStock', productStockDocId);
        const updatedTotalQty = productStockMap[productCode].totalQty + itemQuantity;

        // Update the totalQty in the productStock document
        await updateDoc(productStockRef, {
          totalQty: updatedTotalQty
        });
      } else {
        console.warn(`Product with code ${productCode} not found in product stock.`);
      }
    }

    // Create a log entry in dispatchLogs
    await addDoc(dispatchLogsRef, {
      dispatchId: dispatchId,
      operation: "delete",
      items: items.map(item => ({
        productCode: item.productCode,
        quantity: item.quantity,
      })),
      timestamp: serverTimestamp(),
      description: `Deleted dispatch ${dispatchId} and updated product stock for ${items.length} items.`
    });

    // Delete the entire dispatch document
    await deleteDoc(dispatchRef);
    console.log(`Dispatch ${dispatchId} deleted successfully.`);

    // Optionally, fetch dispatch logs or any other necessary updates
    await fetchDispatchLogs();

  } catch (error) {
    console.error("Error deleting dispatch: ", error);
  }
}

async function updateproductStock(dispatchId,productCode) {
  try {
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

    //const { productCode, quantity } = itemToDelete;
    const productData = productStockMap[productCode];

    if (productData) {
      const newStockQuantity = productData.totalQty + quantity;

      const productStockRef = doc(db, 'productStock', productData.docId);
      await updateDoc(productStockRef, { totalQty: newStockQuantity });

      const productToUpdate = products.value.find(p => p.productCode === productCode);
      if (productToUpdate) {
        productToUpdate.totalQty = newStockQuantity;
      }

      console.log(`Updated stock for ${productCode}. New totalQty: ${newStockQuantity}`);
    } else {
      console.log(`Product with code ${productCode} not found in productStock.`);
    }
  } catch (error) {
    console.error('Error updating productStock:', error);
  }
}

</script>
