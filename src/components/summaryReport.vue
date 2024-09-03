<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const products = ref([]);
const salesData = ref([]);
const dispatchData = ref({});
const shops = ref([]);
const selectedShop = ref('');
const startDate = ref('');
const endDate = ref('');

const sortBy = ref('');
const sortOrder = ref('asc');

const fetchSales = async () => {
  const start = Timestamp.fromDate(new Date(startDate.value));
  const end = Timestamp.fromDate(new Date(endDate.value + ' 23:59:59'));

  const salesQuery = query(
    collection(db, 'monthlySales'),
    where('UpdateDate', '>=', start),
    where('UpdateDate', '<=', end),
    where('shopCode', '==', selectedShop.value)
  );

  const querySnapshot = await getDocs(salesQuery);

  const aggregatedSales = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const productCode = data.ProductCode;
    const quantity = data.quantity;

    if (aggregatedSales[productCode]) {
      aggregatedSales[productCode] += quantity;
    } else {
      aggregatedSales[productCode] = quantity;
    }
  });

  // Map over products and populate sales data
  salesData.value = products.value.map((product) => {
    const totalSales = aggregatedSales[product.productCode] || 0;
    const totalDispatch = dispatchData.value[product.productCode] || 0;
    const balance = totalDispatch - totalSales;
    const stockValue = product.distributorPrice * balance;

    return {
      ProductCode: product.productCode,
      ProductName: product.productName,
      TotalSales: totalSales,
      TotalDispatch: totalDispatch,
      Balance: balance,
      StockValue: stockValue.toFixed(0),
    };
  });

  sortData(); // Sort data after fetching
};

const fetchDispatches = async () => {
  const start = Timestamp.fromDate(new Date(startDate.value));
  const end = Timestamp.fromDate(new Date(endDate.value + ' 23:59:59'));

  const dispatchQuery = query(
    collection(db, 'dispatches'),
    where('date', '>=', start),
    where('date', '<=', end),
    where('selectedShop', '==', selectedShop.value)
  );

  const querySnapshot = await getDocs(dispatchQuery);

  const aggregatedDispatch = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const items = data.items;

    items.forEach((item) => {
      const productCode = item.productCode;
      const quantity = item.quantity;

      if (aggregatedDispatch[productCode]) {
        aggregatedDispatch[productCode] += quantity;
      } else {
        aggregatedDispatch[productCode] = quantity;
      }
    });
  });

  dispatchData.value = aggregatedDispatch;

  fetchSales(); // This will also trigger sorting after fetching sales
};

const fetchShops = async () => {
  try {
    const shopsSnapshot = await getDocs(collection(db, 'SHOPS'));
    shops.value = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching shops:', error);
  }
};

const getProductName = (productCode) => {
  const product = products.value.find(p => p.productCode === productCode);
  return product ? product.productName : productCode;
};

const handleFilterChange = () => {
  fetchDispatches();
  fetchSales();
};

const sortData = () => {
  salesData.value.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortBy.value] < b[sortBy.value]) return -1 * modifier;
    if (a[sortBy.value] > b[sortBy.value]) return 1 * modifier;
    return 0;
  });
};

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
  sortData();
};

onMounted(async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    products.value = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      productCode: doc.data().productCode,
      productName: doc.data().productName,
      distributorPrice: doc.data().distributorPrice,
    }));

    await fetchShops();
    fetchDispatches();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<template>
  <div>
    <div class="flex items-center space-x-4 p-4 bg-gray-300 rounded-lg">
      <!-- Filters section -->
      <label>Select a Shop</label>
      <select
        v-model="selectedShop" @change="handleFilterChange"
        class="block p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500"
      >
        <option selected>select a shop</option>
        <option v-for="shop in shops" :key="shop.id" :value="shop.shopCode">
          {{ shop.shopName }}
        </option>
      </select>
      <label>From:</label>
      <input
        type="date"
        v-model="startDate" @change="handleFilterChange"
        class="block p-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <label>To:</label>
      <input
        type="date"
        v-model="endDate" @change="handleFilterChange"
        class="block p-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <button @click="fetchDispatchLogs" class="bg-blue-500 text-white p-2 rounded-lg">Search</button>
    </div>

    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3 cursor-pointer" @click="handleSort('ProductCode')">
              Product Code
            </th>
            <th scope="col" class="px-6 py-3 cursor-pointer" @click="handleSort('ProductName')">
              Product Name
            </th>
            <th scope="col" class="px-6 py-3 cursor-pointer" @click="handleSort('TotalDispatch')">
              Total Dispatch
            </th>
            <th scope="col" class="px-6 py-3 cursor-pointer" @click="handleSort('TotalSales')">
              Total Sales
            </th>
            <th scope="col" class="px-6 py-3" >
              Closing Stock
            </th>
            <th scope="col" class="px-6 py-3 cursor-pointer" @click="handleSort('StockValue')">
              Stock Value
            </th>
            <th scope="col" class="px-6 py-3">
              Expiries
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in salesData" :key="item.ProductCode" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ item.ProductCode }}
            </th>
            <td class="px-6 py-4 text-gray-700 text-bold">
              {{ item.ProductName }}
            </td>
            <td class="px-6 py-4">
              {{ item.TotalDispatch }}
            </td>
            <td class="px-6 py-4 flex items-center">
              {{ item.TotalSales }}
              <span v-if="item.TotalSales <= 5 && item.Balance >= 10" class="text-yellow-500 ml-2">
                ⚠️
              </span>
            </td>
            <td class="px-6 py-4 text-bold" :class="{'text-red-500': item.Balance <= 0}">
              {{ item.Balance }}
            </td>
            <td class="px-6 py-4">
              ${{ item.StockValue }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
