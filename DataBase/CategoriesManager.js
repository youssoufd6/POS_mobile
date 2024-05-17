import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({
  name:'bdd',
  location: 'default'
},
()=>{console.log('creation reussi')},
error => {console.log(error)}
);

export const CategoriesManager = {

      createCategories: ()=>{
        db.transaction((tx)=>{
          tx.executeSql("CREATE TABLE IF NOT EXISTS categories (\
                    id INTEGER PRIMARY KEY,\
                    name TEXT NOT NULL\
                );"
            );
        }, error => console.log(error))
        
      },

    insertCategory: (id,name)=>{
        db.transaction((tx)=>{
          tx.executeSql("INSERT INTO categories (id,name) VALUES (?,?)", [id,name],  
            (_, results) => console.log(results.rowsAffected),  
            error => console.log(error)                                              
          )
        })
      },
      searchCategoryByID: (id) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM categories WHERE ID= ?",
                    [id],
                    (_, result) => {
                        if (!result.rows.length) {
                            //console.log("Pas d'élément correspondant");
                            resolve(false);
                        } else {
                            resolve(true);
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
    
    updateCategory: (id, name) => {
        db.transaction((tx)=>{
            tx.executeSql(
              "UPDATE categories SET name=? WHERE id=?",
              [name,id],
              ()=>{console.log('modification reussi')},
              error=>{console.log(error)}
            )
          })
    },

    allCategories: () => {
      return new Promise((resolve, reject) => {
          db.transaction((tx) => {
              tx.executeSql(
                  'SELECT * FROM categories',
                  [],
                  (_, result) => {
                      if (!result.rows.length) {
                         // console.log("Le tableau de catégories est vide");
                          resolve([]); // Retourne un tableau vide si aucune catégorie n'est trouvée
                      } else {
                          const categories = [];
                          for (let i = 0; i < result.rows.length; i++) {
                              categories.push(result.rows.item(i));
                              
                          }
                          resolve(categories); // Retourne le tableau des catégories trouvées
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
  TruncateCategories: () => {
    db.transaction((tx)=>{
        tx.executeSql(
          "DELETE FROM categories",
          [],
          ()=>{console.log('Vidage réussi')},
          error=>{console.log(error)}
        )
      })
},
DropCategories: ()=>{
    db.transaction((tx)=>{
      tx.executeSql('DROP TABLE Categories'
        );
    }, error => console.log(error), success => console.log('Transaction successful'))
    
  },


  
  
};
