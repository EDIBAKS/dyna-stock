import { defineStore } from 'pinia';
import { ref,reactive, computed } from 'vue';
import { collection, getDocs, query, doc, setDoc, updateDoc, increment, addDoc, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path to your Firebase config

export const useInventoryStore = defineStore('inventory', () => {
  const shops = ref([]);
  const products = ref([]);
  const dispatches = ref([]);
  const productStock = ref([]);

  const loadShops = async () => {
    const querySnapshot = await getDocs(collection(db, 'SHOPS'));
    shops.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const loadProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productDocs = querySnapshot.docs;

    const productDataPromises = productDocs.map(async productDoc => {
      const productData = productDoc.data();

      // Query productStock collection where productCode matches
      const productStockQuery = query(
        collection(db, 'productStock'),
        where('productCode', '==', productData.productCode)
      );

      const productStockSnapshot = await getDocs(productStockQuery);

      // Assuming there's only one matching document in productStock
      const totalQty = !productStockSnapshot.empty
        ? productStockSnapshot.docs[0].data().totalQty
        : 0;

      return { id: productDoc.id, ...productData, totalQty };
    });

    products.value = await Promise.all(productDataPromises);
  };

  const loadDispatches = async () => {
    try {
      const dispatchesSnapshot = await getDocs(collection(db, 'dispatches'));
      dispatches.value = dispatchesSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error loading dispatches:", error);
    }
  };
// Function to get dispatch quantity for a specific product and shop
const getDispatchQuantity = (productCode, shopCode) => {
  if (!dispatches.value || dispatches.value.length === 0) {
    return 0; // Return 0 if dispatches is empty or undefined
  }

  // Find the dispatch that matches both the product code and shop code
  const matchingDispatch = dispatches.value.find(
    (dispatch) => dispatch.productCode === productCode && dispatch.selectedShop === shopCode
  );

  // Return the quantity if found, otherwise return 0
  return matchingDispatch ? matchingDispatch.quantity : 0;
};



 
  const getProductStock = (productId, shopId) => {
    const stockEntry = productStock.value.find(p => p.productId === productId && p.shopId === shopId);
    return stockEntry ? stockEntry.totalQty : 0;
  };

  const handleDispatch = async (productId, productName, shopId, shopName, quantity, dateEntered) => {
    const existingDispatch = dispatches.value.find(d =>
      d.productId === productId && d.shopId === shopId && d.dateEntered === dateEntered
    );

    if (existingDispatch) {
      // Update existing dispatch
      await updateDoc(doc(db, 'dispatches', existingDispatch.id), {
        quantity: increment(quantity),
      });

      // Log the dispatch update
      await addDoc(collection(db, 'dispatchLog'), {
        productId,
        productName,
        shopId,
        shopName,
        quantity,
        dateEntered,
        action: 'update',
      });

      // Update totalStock in productStock collection
      await updateDoc(doc(db, 'productStock', productId), {
        totalQty: increment(-quantity),
      });
    } else {
      // Create new dispatch
      const newDispatch = {
        productId,
        productName,
        shopId,
        shopName,
        quantity,
        dateEntered,
      };
      const docRef = await setDoc(doc(collection(db, 'dispatches')), newDispatch);

      // Log the new dispatch
      await addDoc(collection(db, 'dispatchLog'), {
        productId,
        productName,
        shopId,
        shopName,
        quantity,
        dateEntered,
        action: 'create',
      });

      // Update totalStock in productStock collection
      await updateDoc(doc(db, 'productStock', productId), {
        totalQty: increment(-quantity),
      });
    }

    // Reload dispatches and product stock after update
    await loadDispatches();
    // await loadProductStock(); // Uncomment if productStock is needed
  };

  // Computed property to format dispatch data for the table

  return {
    shops,
    products,
    dispatches,
    productStock,
    loadShops,
    loadProducts,
    loadDispatches,
    getProductStock,
    handleDispatch,
    getDispatchQuantity
   // Export computed data for table
  };
});
