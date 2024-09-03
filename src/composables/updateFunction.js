import { ref } from 'vue';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

import { db } from '../firebase';

export function useDispatches() {
  const dispatches = ref([]);

  const updateDispatchItem = async (dispatchId, shopCode, oldItem, newQuantity) => {
    try {
      const dispatchRef = doc(db, 'dispatches', dispatchId);
      const productStockRef = doc(db, 'productStock', oldItem.productCode);

      const difference = newQuantity - oldItem.quantity;

      // Update productStock totalQty
      await updateDoc(productStockRef, {
        totalQty: increment(-difference)
      });

      // Update the item's quantity in dispatches
      const updatedItem = { ...oldItem, quantity: newQuantity };
      await updateDoc(dispatchRef, {
        items: arrayRemove(oldItem)
      });
      await updateDoc(dispatchRef, {
        items: arrayUnion(updatedItem)
      });
    } catch (error) {
      console.error("Error updating dispatch item: ", error);
    }
  };

  const deleteDispatchItem = async (dispatchId, shopCode, itemToDelete) => {
    try {
      const dispatchRef = doc(db, 'dispatches', dispatchId);
      const productStockRef = doc(db, 'productStock', itemToDelete.productCode);

      // Update productStock totalQty
      await updateDoc(productStockRef, {
        totalQty: increment(itemToDelete.quantity)
      });

      // Remove the item from dispatches
      await updateDoc(dispatchRef, {
        items: arrayRemove(itemToDelete)
      });
    } catch (error) {
      console.error("Error deleting dispatch item: ", error);
    }
  };

  return {
    dispatches,
    updateDispatchItem,
    deleteDispatchItem,
  };
}
