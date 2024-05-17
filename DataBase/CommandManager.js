import SQLite from 'react-native-sqlite-storage';
import { ProductsManager } from './ProductsManager';


const db = SQLite.openDatabase({
    name: 'bdd',
    location: 'default'
},
    () => { console.log('Création réussie') },
    error => { console.log(error) }
);



export const CommandManager = {
    createTables: () => {
        db.transaction((tx) => {
            // Création de la table Commandes
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS Commandes (\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    date DATE NOT NULL,\
                    user INTEGER NULL,\
                    status VARCHAR(20) NOT NULL,\
                    total DECIMAL(10, 2) NOT NULL\
                );"
            );

            //table pour le mode de payement
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS payements (\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    moyen VARCHAR(30) NOT NULL,\
                    montant DECIMAL(10, 2) NOT NULL,\
                    commande_id INTEGER NOT NULL,\
                    status VARCHAR(20) NOT NULL,\
                    FOREIGN KEY (commande_id) REFERENCES Commandes(id)\
                );"
            );

            //cette table est fictive pour stocker la joincture de la ligne de commandes au produits  afin de faciliter la fluiditer de l'historique
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS LignesDeCommandeStockees(\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    commande_id INTEGER,\
                    quantite INTEGER,\
                    nom_produit TEXT,\
                    prix_produit REAL,\
                    total REAL\
                );"
            );
            
            // Création de la table LignesDeCommande
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS LignesDeCommande (\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    commande_id INTEGER NOT NULL,\
                    produit_id INTEGER NOT NULL,\
                    quantite INTEGER NOT NULL,\
                    status VARCHAR(20) NOT NULL,\
                    price DECIMAL(10, 2) NOT NULL,\
                    FOREIGN KEY (commande_id) REFERENCES Commandes(id),\
                    FOREIGN KEY (produit_id) REFERENCES Produits(id)\
                );"
            );
        }, (error) => {
            console.log("Erreur lors de la création des tables :", error);
        });
    },

    insertLDCMDStockees: (commande_id, quantite, nom_produit,prix_produit,total) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO LignesDeCommandeStockees (commande_id, quantite, nom_produit,prix_produit,total) VALUES (?,?,?,?,?)",
                    [commande_id, quantite, nom_produit,prix_produit,total],
                    (_, results) => {
                        console.log('ajout des LignesDeCommandeStockees effectuées')
                    },
                    (error) => {
                        console.log("Erreur lors de l'ajout de la commande :", error);
                        reject(error);
                    }
                );
            });
        });
    },

    insertCommande: (total,user) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO Commandes (date, status, total,user) VALUES (datetime('now'), 'way', ?,?)",
                    [total,user],
                    (_, results) => {
                       // console.log("Commande ajoutée avec succès");
                        // Récupérer l'ID de la commande insérée
                        const commandeId = results.insertId;
                        resolve(commandeId);
                    },
                    (error) => {
                        console.log("Erreur lors de l'ajout de la commande :", error);
                        reject(error);
                    }
                );
            });
        });
    },
    insertLigneDeCommande: (commandeId, produitId, quantite,price) => {
        return new Promise((resolve, reject) => {
            // Utiliser searchProductsByID pour obtenir les détails du produit
            ProductsManager.searchProductsByID(produitId)
                .then((product) => {
                    if (product) {
                        // Vérifier si la quantité en stock est suffisante
                        if (product.quantity - quantite >= 0) {
                            // Si la quantité en stock est suffisante, ajouter la ligne de commande
                            db.transaction((tx) => {
                                tx.executeSql(
                                    "INSERT INTO LignesDeCommande (commande_id, produit_id, quantite,price, status) VALUES (?, ?, ?,?,'way')",
                                    [commandeId, produitId,quantite,price],
                                    (_, results) => {
                                        console.log("Ligne de commande ajoutée avec succès");
                                        resolve(results.insertId); // Résoudre la promesse avec l'ID de la ligne de commande
                                    },
                                    (error) => {
                                        console.log("Erreur lors de l'ajout de la ligne de commande :", error);
                                        reject(error);
                                    }
                                );
                            });
                            ProductsManager.updateProductQuantity(produitId,(product.quantity - quantite),product.quantity)
                       
                            
                        } else {
                            // Si la quantité en stock est insuffisante, rejeter la promesse avec un message d'erreur
                            reject(new Error("Quantité en stock insuffisante"));
                        }
                    } else {
                        // Si le produit n'est pas trouvé, rejeter la promesse avec un message d'erreur
                        reject(new Error("Produit non trouvé"));
                    }
                })
                .catch((error) => {
                    console.log("Erreur lors de la recherche du produit :", error);
                    reject(error);
                });
        });
    },
    SelectCmd:()=>{
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM Commandes ORDER BY id DESC',
                    [],
                    (_, result) => {
                        if (!result.rows.length) {
                            console.log("Le tableau de commande  est vide");
                            resolve([]); // Retourne un tableau vide si aucune catégorie n'est trouvée
                        } else {
                            const commande = [];
                            for (let i = 0; i < result.rows.length; i++) {
                                commande.push(result.rows.item(i));
                                
                            }
                            resolve(commande); // Retourne le tableau des catégories trouvées
                        }
                    },
                    (error) => {
                        console.error("Erreur lors de l'exécution de la requête SQL :", error);
                        reject(error); // Rejette la promesse en cas d'erreur
                    }
                );
            });
        });
    },
 
    insertPayement: (moyen, montant,commande_id) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO payements (moyen, montant,commande_id,status) VALUES (?,?,?,'way')",
                    [moyen, montant,commande_id],
                    (_, results) => {
                       // console.log("Commande ajoutée avec succès");
                        // Récupérer l'ID de la commande insérée
                        const payements = results.insertId;
                        resolve(payements);
                    },
                    (error) => {
                        console.log("Erreur lors de l'ajout de la commande :", error);
                        reject(error);
                    }
                );
            });
        });
    },
    DropCmd: ()=>{
        db.transaction((tx)=>{
          tx.executeSql('DROP TABLE Commandes'
            );
        }, error => console.log(error), success => console.log('Supression successful'))
        
    },
    DropPayements: ()=>{
        db.transaction((tx)=>{
          tx.executeSql('DROP TABLE payements'
            );
        }, error => console.log(error), success => console.log('Supression successful'))
        
    },
    DropLigneCmd: ()=>{
        db.transaction((tx)=>{
          tx.executeSql('DROP TABLE LignesDeCommande'
            );
        }, error => console.log(error), success => console.log('Supression successful'))
        
    },
    DeleteLigneCmd: (id)=>{
        db.transaction((tx)=>{
          tx.executeSql('DELETE FROM LignesDeCommande WHERE id = ?'
            ,[id]);
            console.log('Ligne de  commande supprimée')
        }, error => console.log(error), success => console.log('Supression successful'))
        
    },
    DeleteCmd: (id)=>{
        db.transaction((tx)=>{
          tx.executeSql('DELETE FROM Commandes WHERE id = ?'
          ,[id]);
            console.log('commande supprimée')
        }, error => console.log(error), success => console.log('Supression successful'))
        
    },
    updateStatusCommande: (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                "UPDATE commandes SET status='valider' WHERE id=?",
                [id],
                () => { console.log('Modification du status commande réussie'); },
                (error) => { console.log('Erreur lors de la mise à jour :', error); }
            );
        });
    },
    updateStatusPayement: (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                "UPDATE Payements SET status='valider' WHERE id=?",
                [id],
                () => { console.log('Modification du status Payement réussie'); },
                (error) => { console.log('Erreur lors de la mise à jour :', error); }
            );
        });
    },
    updateStatusLigneDeCommande: (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                "UPDATE LignesDeCommande SET status='valider' WHERE id=?",
                [id],
                () => {  console.log('Modification du status de ligne de commande réussie'); CommandManager.DeleteLigneCmd(); },
                (error) => { console.log('Erreur lors de la mise à jour :', error); }
            );
        });
    },
    selectLigneDeCommandByStatus: (id) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM LignesDeCommande WHERE status = 'way' and commande_id=?",
                    [id],
                    (_, result) => {
                        const ligneCmd = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            ligneCmd.push(result.rows.item(i));
                        }
                        console.log('les ligneCmd dans la table : '+ligneCmd)
                        resolve(ligneCmd); // Retourne le tableau des ligneCmd trouvées
                    },
                    (error) => {
                        console.error("Erreur lors de l'exécution de la requête SQL :", error);
                        reject(error); // Rejette la promesse en cas d'erreur
                    }
                );
            },
            (error) => {
                console.error("Erreur lors de la transaction :", error);
                reject(error); // Rejette la promesse en cas d'erreur de transaction
            });
        });
    },
    selectCommandByStatus: () => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM commandes WHERE status = 'way'",
                    [],
                    (_, result) => {
                        const commandes = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            commandes.push(result.rows.item(i));
                        }
                        console.log('les commandes la table : '+commandes)
                        resolve(commandes); // Retourne le tableau des commandes trouvées
                    },
                    (error) => {
                        console.error("Erreur lors de l'exécution de la requête SQL :", error);
                        reject(error); // Rejette la promesse en cas d'erreur
                    }
                );
            },
            (error) => {
                console.error("Erreur lors de la transaction :", error);
                reject(error); // Rejette la promesse en cas d'erreur de transaction
            });
        });
    },
    selectPayementByStatus: (id) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM Payements WHERE status = 'way' and commande_id=?",
                    [id],
                    (_, result) => {
                        const payements = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            payements.push(result.rows.item(i));
                        }
                        console.log('les Payements de la table : '+payements)
                        resolve(payements); // Retourne le tableau des commandes trouvées
                    },
                    (error) => {
                        console.error("Erreur lors de l'exécution de la requête SQL :", error);
                        reject(error); // Rejette la promesse en cas d'erreur
                    }
                );
            },
            (error) => {
                console.error("Erreur lors de la transaction :", error);
                reject(error); // Rejette la promesse en cas d'erreur de transaction
            });
        });
    },
    selectLDCMDStockeesById: (id) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM LignesDeCommandeStockees WHERE commande_id=?",
                    [id],
                    (_, result) => {
                        const LignesDeCommandeStockees = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            LignesDeCommandeStockees.push(result.rows.item(i));
                        }
                        console.log('les LignesDeCommandeStockees de la table : '+LignesDeCommandeStockees)
                        resolve(LignesDeCommandeStockees); // Retourne le tableau des commandes trouvées
                    },
                    (error) => {
                        console.error("Erreur lors de l'exécution de la requête SQL :", error);
                        reject(error); // Rejette la promesse en cas d'erreur
                    }
                );
            },
            (error) => {
                console.error("Erreur lors de la transaction :", error);
                reject(error); // Rejette la promesse en cas d'erreur de transaction
            });
        });
    },
    
    
};
