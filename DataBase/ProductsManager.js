import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({
  name:'bdd',
  location: 'default'
},
()=>{console.log('creation reussi')},
error => {console.log(error)}
);

export const ProductsManager = {
  
    creationProducts: () => {
        db.transaction((tx) => {
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS products (\
                id INTEGER PRIMARY KEY,\
                category INTEGER NOT NULL,\
                name TEXT NOT NULL,\
                quantity INTEGER NOT NULL,\
                quantity_init INTEGER ,\
                price REAL NOT NULL,\
                image TEXT NULL\
            )",
            [],
            () => console.log('Table products créée avec succès'),
            error => console.log("Erreur lors de la création de la table products :", error)
          );
        });
      },
      
      DropProducts: ()=>{
        db.transaction((tx)=>{
          tx.executeSql('DROP TABLE products'
            );
        }, error => console.log(error), success => console.log('Transaction successful'))
        
      },

    insertProducts: (id,category,name,quantity,quantity_init,price,image)=>{
        db.transaction((tx)=>{
          tx.executeSql("INSERT INTO products (id,category, name, quantity, quantity_init, price, image) VALUES (?,?, ?, ?, ?, ?, ?)", 
          [id,category,name,quantity,quantity_init,price,image],  
            (_, results) => //console.log(results.rowsAffected),  
            error => console.log(error)                                              
          )
        })
      },
      searchProductsByID: (id) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM products WHERE ID= ?",
                    [id],
                    (_, result) => {
                        if (result.rows.length === 0) {
                           // console.log("Pas d'élément correspondant");
                            resolve(null); // Résoudre la promesse avec null si aucun produit n'est trouvé
                        } else {
                            const product = result.rows.item(0); // Récupérer le premier élément (s'il existe)
                            resolve(product); // Résoudre la promesse avec le produit trouvé
                        }
                    },
                    (error) => {
                        console.error("Erreur lors de l'exécution de la requête SQL :", error);
                        reject(error);
                    }
                );
            });
        });
    },
    
    
    updateProduct: (id, name,category, quantity, quantity_init, price, image) => {
      db.transaction((tx) => {
          tx.executeSql(
              "UPDATE products SET name = ?,category = ?, quantity = ?, quantity_init = ?, price = ?, image = ? WHERE id = ?",
              [name ,category , quantity , quantity_init , price , image ,id],
              () => { console.log('Modification du produits réussie'); },
              (error) => { console.log('Erreur lors de la mise à jour :', error); }
          );
      });
  },

  updateProductQuantity: (id, quantity, quantity_init) => {
    db.transaction((tx) => {
        tx.executeSql(
            "UPDATE products SET quantity=?, quantity_init=? WHERE id=?",
            [quantity, quantity_init, id],
            () => { console.log('Modification du produits réussie'); },
            (error) => { console.log('Erreur lors de la mise à jour de la quantité :', error); }
        );
    });
},

  

    allproducts: () => {
      return new Promise((resolve, reject) => {
          db.transaction((tx) => {
              tx.executeSql(
                  'SELECT * FROM products where quantity > 0',
                  [],
                  (_, result) => {
                      if (!result.rows.length) {
                          //console.log("Le tableau  est vide");
                          resolve([]); // Retourne un tableau vide si aucune catégorie n'est trouvée
                      } else {
                          const products = [];
                          for (let i = 0; i < result.rows.length; i++) {
                              products.push(result.rows.item(i));
                              
                          }
                          resolve(products); // Retourne le tableau des catégories trouvées
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


  getProductsByCategory: (id) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM products where category = ? and quantity > 0 ',
                [id],
                (_, result) => {
                    if (!result.rows.length) {
                        //console.log("Le tableau  est vide");
                        resolve([]); // Retourne un tableau vide si aucune catégorie n'est trouvée
                    } else {
                        const products = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            products.push(result.rows.item(i));
                            
                        }
                        resolve(products); // Retourne le tableau des catégories trouvées
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
  
  
};
