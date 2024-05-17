import axios from "axios";
import { CommandManager } from "../DataBase/CommandManager";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseApi } from "../BaseApi/BaseApi";
import { UpdateAndSelectDatas } from "./UpdateAndSelectDatas";

export const UpdateVentes = {
 

  update: async (token) => {
    try {
      const commands = await CommandManager.selectCommandByStatus();
      
      if (!commands || commands.length === 0) {
        return;
      }

      await Promise.all(commands.map(async (cmd) => {
        try {
          
          const response = await axios.post(BaseApi.pos + '/api/sales', {
            "montant": cmd.total,
            "created_at": cmd.date,
            "user": `/api/users/${cmd.user}` 
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Réponse de la requête de vente :', response.data);
          
          await Promise.all([
            CommandManager.updateStatusCommande(cmd.id),
            
          ]);

          // Sélection de toutes les lignes de commandes en fonction du statut
          const ligneCommands = await CommandManager.selectLigneDeCommandByStatus(cmd.id);
          await Promise.all(ligneCommands.map(async (ligneCmd) => {
            try {
              await axios.post(BaseApi.pos + '/api/sale_items', {
                "quantity": ligneCmd.quantite,
                "sale": `/api/sales/${response.data.id}`,
                "type": false,
                "price": ligneCmd.price,
                "product": `/api/products/${ligneCmd.produit_id}`
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              await CommandManager.updateStatusLigneDeCommande(ligneCmd.id);
            } catch (error) {
              if (error.message.includes('Network')) {
                ToastAndroid.show('Vous travaillez hors ligne', ToastAndroid.SHORT);
              }else if (error.message.includes('401')) {
                
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('id');
                await AsyncStorage.removeItem('firstName');
                await AsyncStorage.removeItem('lastName');

                return 'SessionExpired';
              }
              else{
                console.log('erreur lors de la requete vente ', error)
              }
            }
          }));

          //traitement du mode de paiement
          const payements = await CommandManager.selectPayementByStatus(cmd.id);
          await Promise.all(payements.map(async (paye) => {
            try {
              await axios.post(BaseApi.pos + '/api/payments', {
                "moyen": paye.moyen,
                "montant": paye.montant,
                "sale": `/api/sales/${response.data.id}`,
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('Réponse de la requête payement :', paye);
              await CommandManager.updateStatusPayement(paye.id);
            } catch (error) {
              console.log("Erreur lors de la requête du payement :", error);
            }
          }));
        } catch (error) {
          console.log('Erreur lors de la requête de vente :', error);
          if (error.message.includes('401')) {
            
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('id');
            await AsyncStorage.removeItem('firstName');
            await AsyncStorage.removeItem('lastName');
            return 'SessionExpired';
          }
        }
      }));
    } catch (error) {
      console.log("Erreur lors de la récupération des commandes :", error);
    }
  }
};
