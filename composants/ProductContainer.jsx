import React, { useEffect, useState } from 'react';
import { Text, View, Alert, ActivityIndicator, RefreshControl, ScrollView, ToastAndroid } from 'react-native';
import { Categories } from './Categories';
import { Recherche } from './Recherche';
import Listeproducts from './Listeproducts';
import { ProductsManager } from '../DataBase/ProductsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UpdateAndSelectDatas } from './UpdateAndSelectDatas';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { usePanier } from './PanierContext';
import { useNetInfo } from '@react-native-community/netinfo';
import tw from 'twrnc'

const ProductContainer = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [quantityACommander, setQuantityACommander] = useState({});
    const { panier, setPanier } = usePanier({});
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const { categorySelected, setCategorieSelected } = usePanier(null);
    const [first, setFirst] = useState(false)


  


    const handleTabClick = (filteredproducts) => {
        setProducts(filteredproducts);
    };

    const HandleSearch = (searchproducts) => {
        setProducts(searchproducts);
    };
  

    const refreshData = async () => {
        if(!first){
            ToastAndroid.show("Scrollez l'ecran du haut vers le bas pour la reactualisation si toutes les données n'ont pas étés chargées", ToastAndroid.LONG)
            setFirst(true) 
            
        }
        setLoading(true);
        
        const token = await AsyncStorage.getItem('token');
        UpdateAndSelectDatas.fetchProducts(token)
        UpdateAndSelectDatas.fetchCategories(token)
            .then(result => {
                if (result === 'SessionExpired') {
                    setIsLoggedIn(false);
                    navigation.navigate('login');
                }
            });
        try {
            if (products.length === 0 || !categorySelected || categorySelected === 0) {
                const fetchedProducts = await ProductsManager.allproducts();
                setProducts(fetchedProducts);
            } else {
                const fetchedProducts = await ProductsManager.getProductsByCategory(categorySelected);
                setProducts(fetchedProducts);
            }
        } catch (error) {
            console.error('Une erreur s\'est produite lors du chargement des produits :', error);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        const token = await AsyncStorage.getItem('token');
        UpdateAndSelectDatas.fetchCategories(token);
        UpdateAndSelectDatas.fetchProducts(token)
            .then(result => {
                if (result === 'SessionExpired') {
                    ToastAndroid.show('votre session a expiré, connectez-vous à nouveau',ToastAndroid.SHORT)
                    setIsLoggedIn(false);
                    navigation.navigate('login');
                }
            });
        setRefreshing(true);
        refreshData();
        setRefreshing(false);
    };

    useEffect(() => {
        const refPanier = async () => {
            if (Object.keys(panier).length === 0) {
                setQuantityACommander({});
                refreshData();
            }
        };
        
        refPanier();
    }, [panier]);

    const incrementeQuantity = (id) => {
        const product = products.find(p => p.id === id);
        const currentQuantity = quantityACommander[id] || 0;
        const newQuantity = currentQuantity + 1;

        if (newQuantity > product.quantity) {
            Alert.alert("Alerte", "La quantité demandée dépasse la quantité en stock.");
            return;
        }

        setQuantityACommander(prevState => ({
            ...prevState,
            [id]: newQuantity
        }));

        const nouveauPanier = {
            ...panier,
            [product.id]: {
                nom: product.name,
                quantity: newQuantity,
                price: product.price,
                total_price: product.price * newQuantity,
                image: product.image ? product.image : '',
            }
        };

        setPanier(nouveauPanier);
    };

    const decrementeQuantity = (id) => {
        if (quantityACommander[id] && quantityACommander[id] > 0) {
            setQuantityACommander(prevState => ({
                ...prevState,
                [id]: prevState[id] - 1
            }));

            const product = products.find(p => p.id === id);
            const quantity = quantityACommander[id] - 1;

            const nouveauPanier = {
                ...panier,
                [product.id]: {
                    nom: product.name,
                    quantity: quantity,
                    price: product.price,
                    total_price: product.price * quantity,
                    image: product.image ? product.image : '',
                }
            };

            if (quantity > 0) {
                setPanier(nouveauPanier);
            } else {
                const { [id]: deletedProduct, ...rest } = panier;
                setPanier(rest);
            }
        }
    };

    const updateQuantity = (id, value) => {
        const intValue = parseInt(value, 10);
        const product = products.find(p => p.id === id);

        if (value === '' || (!isNaN(intValue) && intValue >= 0 && intValue <= product.quantity)) {
            const quantity = value === '' ? 0 : intValue;

            setQuantityACommander(prevState => ({
                ...prevState,
                [id]: value === '' ? 0 : intValue
            }));

            const nouveauPanier = {
                ...panier,
                [product.id]: {
                    nom: product.name,
                    quantity: quantity,
                    price: product.price,
                    total_price: product.price * quantity,
                    image: product.image ? product.image : '',
                }
            };

            if (quantity > 0) {
                setPanier(nouveauPanier);
            } else {
                const { [id]: deletedProduct, ...rest } = panier;
                setPanier(rest);
            }
        } else {
            Alert.alert("Erreur", "La quantité demandée n'est pas valide ou dépasse la quantité en stock.");
        }
    };

    return (
        <View className="flex-1">
            <Recherche onSearchClick={HandleSearch} />
            <Categories onTabClick={handleTabClick} />

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#366948" />
                        <Text style={{ color: '#366948' }}>Patientez...</Text>
                    </View>
                ) : products.length > 0 ? (
                    <Listeproducts
                        products={products}
                        quantityACommander={quantityACommander}
                        incrementeQuantity={incrementeQuantity}
                        decrementeQuantity={decrementeQuantity}
                        updateQuantity={updateQuantity}
                    />
                ) : (
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ fontSize: 20 }}>Aucun produit trouvé</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default ProductContainer;
