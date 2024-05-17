import React, { useEffect, useState } from 'react';
import {  Text, View , Alert} from 'react-native';
import { Menu } from '../composants/Menu';
import { Panier } from '../composants/panier';
import { Categories } from '../composants/Categories';
import { Recherche } from '../composants/Recherche';
import { useMenu } from '../composants/MenuContext';
import { ProductsManager } from '../DataBase/ProductsManager';
import Listeproducts from '../composants/Listeproducts';
import tw from 'twrnc';


export const Vente = () => {
    const {menuActive, setMenuActive} = useMenu();
  
    ProductsManager.creationProducts();
      // Tableau de products fictifs
      const [prods, setProds] = useState([
        { id: 1, name: 'Product 1',category:2,quantity:5, price: 30000},
        { id: 2, name: 'Product 2', quantity:10, price: 45000,category:3 },
        { id: 3, name: 'Product 3', quantity:10, price: 9005,category:5 },
        { id: 4, name: 'Product 4', quantity:10, price: 80000,category:2 },
        { id: 5, name: 'Product 5', quantity:10, price: 20000,category:6 },
        { id: 6, name: 'Product 6', quantity:10, price: 2000,category:2 },
        { id: 7, name: 'Product 7', quantity:10, price: 9852,category:10 },
        { id: 8, name: 'Product 8', quantity:10, price: 53553,category:5 },
        { id: 9, name: 'Product 9', quantity:10, price: 58235,category:2 },
        { id: 10, name: 'Product 10', quantity:10, price: 21012,category:2 },
        { id: 11, name: 'Product 11', quantity:10, price: 184545,category:2 },
        { id: 12, name: 'Product 12', quantity:10, price: 121012,category:9 },
        { id: 13, name: 'Product 13', quantity:10, price: 8520,category:10 },
        { id: 14, name: 'Product 14', quantity:10, price: 95178,category:3 },
        { id: 15, name: 'Product 15', quantity:10, price: 84851,category:2 },
        { id: 16, name: 'Product 16', quantity:10, price: 82212,category:8 },
        { id: 17, name: 'Product 17', quantity:10, price: 84543,category:10 },
        { id: 18, name: 'Product 18', quantity:10, price: 65456,category:8 },
        { id: 19, name: 'Product 19', quantity:10, price: 74125,category:7 },
        { id: 20, name: 'Product 20', quantity:10, price: 89622,category:2 },
        { id: 21, name: 'Product 21', quantity:10, price: 12455,category:4 },
        { id: 22, name: 'Product 22', quantity:10, price: 95123,category:8 },
        { id: 23, name: 'Product 23', quantity:10, price: 79432,category:2 }
    
    ]);

    const [products, setproduct] = useState([]);
    const [filteredproducts, setFilteredproducts] = useState([]);
    const handleTabClick = (filteredproducts) => {
           setFilteredproducts(filteredproducts);
            setSearchproducts([]);
           
    };
    

    const [selectedCategory, setSelectedCategory] = useState(null);
    const handleCategorySelect = (categoryId) => {
      setSelectedCategory(categoryId);
      // Faites ce que vous voulez avec l'ID de la catégorie sélectionnée
     // console.log("Catégorie sélectionnée :", categoryId);
    };


    const [searchproducts, setSearchproducts] = useState([]);
    const HandleSearch = (searchproducts) => {
        setSearchproducts(searchproducts);
        setFilteredproducts([]);
       
    };

    useEffect(()=>{
        ProductsManager.allproducts()
        .then(response =>{
            setproduct(response)
        })
       

        prods.map((prod)=>{
            ProductsManager.searchProductsByID(prod.id)
            .then(found =>{
                if(!found){
                    ProductsManager.insertProducts(prod.id, prod.category,prod.name, prod.quantity,prod.price, prod.description)
                }
            })
            
        })

    }, [products])
   


   
    const [panier, setPanier] = useState({});

    const [quantityACommander, setQuantityACommander] = useState({});
// Fonction pour incrémenter la quantité à commander d'un product spécifique
const incrementeQuantity = (id) => {
    const product = products.find(p => p.id === id);
    const currentQuantity = quantityACommander[id] || 0;
    const newQuantity = currentQuantity + 1;

    // Vérifier si la quantité à commander est supérieure à la quantité en stock
    if (newQuantity > product.quantity) {
        Alert.alert("La quantité demandée dépasse la quantité en stock.");
        return; // Arrêter l'exécution de la fonction
    }

    setQuantityACommander(prevState => ({
        ...prevState,
        [id]: newQuantity
    }));

    const nouveauPanier = {
        ...panier,
        [product.id]: {
            nom: product.name,
            quantity: newQuantity, // Mettre à jour la quantité dans le panier
            price: product.price * newQuantity // Calculer le prix total
        }
    };
    setPanier(nouveauPanier);
};


// Fonction pour décrémenter la quantité à commander d'un product spécifique
const decrementeQuantity = (id) => {
    if (quantityACommander[id] && quantityACommander[id] > 0) {
        setQuantityACommander(prevState => ({
            ...prevState,
            [id]: prevState[id] - 1
        }));
        const product = products.find(p => p.id === id);
        const quantity = quantityACommander[id] - 1; // Nouvelle quantité à commander
        if (quantity > 0) {
            const nouveauPanier = {
                ...panier,
                [product.id]: {
                    nom: product.name,
                    quantity: quantity, // Mettre à jour la quantité dans le panier
                    price: product.price * quantity // Calculer le price total
                }
            };
            setPanier(nouveauPanier);
        } else {
            const nouveauPanier = { ...panier };
            delete nouveauPanier[product.id]; // Retirer le product du panier
            setPanier(nouveauPanier);
        }
    }
};

const removePanierContent = ()=>{
    setPanier({})
    setQuantityACommander({})
}

const updateQuantity = (id, value) => {
    const intValue = parseInt(value);
    const product = products.find(p => p.id === id);

    // Vérifier si la nouvelle quantité à commander est valide
    if (value === '' || (!isNaN(intValue) && intValue >= 0 && intValue <= product.quantity)) {
        const quantity = value === '' ? 0 : intValue;

        setQuantityACommander(prevState => ({
            ...prevState,
            [id]: value === '' ? 0 : intValue
        }));

        if (quantity > 0) {
            const nouveauPanier = {
                ...panier,
                [product.id]: {
                    nom: product.name,
                    quantity: quantity,
                    price: product.price * quantity
                }
            };
            setPanier(nouveauPanier);
        } else {
            const nouveauPanier = { ...panier };
            delete nouveauPanier[product.id]; // Retirer le product du panier
            setPanier(nouveauPanier);
        }
    } else {
        // Afficher une alerte si la quantité à commander n'est pas valide
        Alert.alert("La quantité demandée n'est pas valide ou dépasse la quantité en stock.");
    }
};



    //console.log(quantityACommander)
    //console.log(panier)



return(
    <View className="flex-1  bg-gray-200">
        <View className=" flex-1 flex-row">
        
        {/** le menu */}
        <Menu/>
          {/** la vente */}

          <View className={menuActive ? "w-8/12 h-[98%]" : "w-7/12 h-[98%]"}>
                {/** la barre de recherche */}
                    <Recherche products={products} onSearchClick={HandleSearch}/>
                {/**fin de la barre de recherche */}
               
                  
                     {/**categories */}
                        <View className='flex-row'>
                            <Categories products={products} onTabClick={handleTabClick} categorySelected={handleCategorySelect} />
                        </View>
                     {/**les products */}
                     {searchproducts.length > 0 ? (
                    <Listeproducts
                        products={searchproducts}
                        menuActive={menuActive}
                        quantityACommander={quantityACommander}
                        incrementeQuantity={incrementeQuantity}
                        decrementeQuantity={decrementeQuantity}
                        updateQuantity={updateQuantity}
                    />
                ) : filteredproducts.length > 0 ? (
                    <Listeproducts
                        products={filteredproducts}
                        menuActive={menuActive}
                        quantityACommander={quantityACommander}
                        incrementeQuantity={incrementeQuantity}
                        decrementeQuantity={decrementeQuantity}
                        updateQuantity={updateQuantity}
                    />) :
                     (products.length > 0 && selectedCategory==1 && searchproducts.length <= 0)  ? (
                    <Listeproducts
                        products={products}
                        menuActive={menuActive}
                        quantityACommander={quantityACommander}
                        incrementeQuantity={incrementeQuantity}
                        decrementeQuantity={decrementeQuantity}
                        updateQuantity={updateQuantity}
                    />
                ) : (
                    <Text>en cours...</Text>
                )}
               


                    

                        {/**fin de la liste des products  */}
          </View>

          {/** fin de la vente */}

          {/** la gestion du panier */}
            <Panier panier={panier} successFullSel={removePanierContent}/>
          {/** fin de la gestion du panier */}

        
          </View>
    </View>
);
    
}
