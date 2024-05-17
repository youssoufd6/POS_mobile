import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import { View , Image, ActivityIndicator} from "react-native"
import { UpdateAndSelectDatas } from "../composants/UpdateAndSelectDatas"
import tw from 'twrnc';

export const Splash = ()=> {
    //etat
    const navigation = useNavigation();

    //comportement
    useEffect(()=>{
        const redirection = async () =>{
        const token = await AsyncStorage.getItem('token');
        UpdateAndSelectDatas.fetchCategories(token);
        UpdateAndSelectDatas.fetchCategories(token);


        setTimeout(()=>{
                
            if(token){  
                navigation.navigate('vente')

            }else{
               // navigation.navigate('login')
               navigation.navigate('vente')

            }
        },3000)

            
            
        }
        //redirection
        redirection();
        
    })

    //affichage
    return(
        <View style={tw`flex mx-auto my-auto`}>
            <Image source={require('../assets/splashA.png')} style={tw`w-45 h-45`}/>
            <ActivityIndicator size="large" color="#366948" />
        </View>
    )


}