
import { CategoriesManager } from "../DataBase/CategoriesManager";
import { ProductsManager } from "../DataBase/ProductsManager";
import { ToastAndroid } from "react-native";
import axios from 'axios';
import { BaseApi } from "../BaseApi/BaseApi";
import { DownloadImage } from "./DownloadImage";
import { DownloadDir } from "./DownloadDir";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UpdateAndSelectDatas={
    

     fetchCategories : async (token) => {
          try {
            const response = await axios.get(BaseApi.pos + '/api/categories',{
              headers:{
                'Authorization': `Bearer ${token}`,
              },
            });
            if(response.data){
              response.data.map((cat)=>{
                CategoriesManager.searchCategoryByID(cat.id)
                .then(found => {
                    if(!found){
                        CategoriesManager.insertCategory(cat.id,cat.name);
                    }
                })
               
            
            })
           
          }
          CategoriesManager.searchCategoryByID(0)
          .then((foundCat)=>{
              if(!foundCat){
                CategoriesManager.insertCategory(0,'Tous');
              }
          })

          } catch (error) {
            if (error.message.includes('Network')) {
              ToastAndroid.show('Vous travaillez hors ligne', ToastAndroid.SHORT);
            }else if (error.message.includes('401')) {
    
              await AsyncStorage.removeItem('token');
              return 'SessionExpired';
            }
          }
        },
    
         fetchProducts: async (token) => {
          try {
            const response = await axios.get(BaseApi.pos + '/api/products',{
              headers:{
                'Authorization': `Bearer ${token}`,
              }
            });
            if (response.data) {
             response.data.map(async (prod) => {
                try {
                      const parts = prod.category.split('/');
                      const category = parts.pop();
                  const found = await ProductsManager.searchProductsByID(prod.id);
                  if (!found) {
                      
                    if (prod.retail_price > 0) {
                      ProductsManager.insertProducts(prod.id, category, prod.name, prod.quantity, prod.quantity, prod.retail_price, prod.image);
                    }
                  } else {
                    var quantityCmd = 0;
                    var newQuantity = 0;
        
                    if (found.quantity != prod.quantity) {
                      quantityCmd = parseInt(found.quantity_init) - parseInt(found.quantity);
                      newQuantity = parseInt(prod.quantity) - quantityCmd;
                    } else{
                      newQuantity = found.quantity;
                    }
        
                    await axios.patch(BaseApi.pos + `/api/products/${prod.id}`, { "quantity": newQuantity }, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/merge-patch+json'
                      }
                    });
    
                    
                    //mise à jour du produit avec gestion des images
                    if (found.quantity === 0 && newQuantity === 0) {
                      if (prod.image) {
                        // Téléchargement et copie de l'image si elle est disponible
                        const sourcePath = BaseApi.pos + '/uploads/products/sale/' + prod.image;
                        const destinationPath = `${prod.image}`;
                        DownloadImage.downloadAndCopyImage(sourcePath, destinationPath);
                        ProductsManager.updateProduct(prod.id, prod.name, category, 0, 0, prod.retail_price, DownloadDir + '/' + destinationPath);
                      } else {
                        // Mise à jour du produit sans image
                        ProductsManager.updateProduct(prod.id, prod.name, category, 0, 0, prod.retail_price, prod.image);
                      }
                    } else {
                      if (prod.image) {
                        // Téléchargement et copie de l'image si elle est disponible
                        const sourcePath = BaseApi.pos + '/uploads/products/sale/' + prod.image;
                        const destinationPath = `${prod.image}`;
                        DownloadImage.downloadAndCopyImage(sourcePath, destinationPath);
                        ProductsManager.updateProduct(prod.id, prod.name, category, newQuantity, prod.quantity, prod.retail_price, DownloadDir + '/' + destinationPath);
                      } else {
                        // Mise à jour du produit sans image
                        ProductsManager.updateProduct(prod.id, prod.name, category, newQuantity, prod.quantity, prod.retail_price, prod.image);
                      }
                    }
    }
                } catch (innerError) {
                  // Gestion des erreurs de recherche ou d'insertion de produits
                  console.error("Erreur lors de la gestion du produit", innerError);
                }
              });
            }
          } catch (error) {
            // Gestion des erreurs de requête réseau
            if (error.message.includes('Network')) {
              ToastAndroid.show('Vous travaillez hors ligne', ToastAndroid.SHORT);
            }else if (error.message.includes('401')) {
    
              await AsyncStorage.removeItem('token');
              return 'SessionExpired';
            }
          }
        },

          
    
}