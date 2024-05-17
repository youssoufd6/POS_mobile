import { Image, ScrollView, Text, View } from "react-native";
import { Menu } from "../composants/Menu";
import tw from 'twrnc'

export const Aide = () =>
    {


        return(
            <View className='flex-1'>
            <View className='flex-1 flex-row'>
            <Menu />
               <ScrollView className='w-10/12 mx-2 mb-3'>
               <View className='mx-auto justify-center items-center'>
                    <View className='mx-auto'>
                        <Text className='text-xl font-bold'>Guide d'utilisation d'AIZE CONNECT</Text>
                    </View>
                    <Text className='text-lg uppercase font-semibold my-1'>1 -{">"} Connexion </Text>
                    <Text className='ml-9'>Après le lancement de l'application, l'utilisateur doit s'authenifier pour avoir accès à AIZE CONNECT.</Text>
                    <Image source={require('../assets/log.png')} className='w-64 h-44 mx-auto'/>


                    <Text className='text-lg uppercase font-semibold my-2'>2 -{">"} Le télécharment et la mise à jour des produits/categories </Text>
                    <Text>le téléchargement et la mise à jour des données sont effectués automatiquement lors du lencement de l'application, s'il echoue ou que vous ne voyez pas les produits ou categories sur la page d'accueil vous devez scroller(tirer) sur l'ecran du haut vers le bas pour effectuer une mise à jour ou un téléchargement automatique. </Text>
                    
                    <Text className='text-lg uppercase font-semibold my-2'>3 -{">"} Accueil </Text>
                    <Image source={require('../assets/v1.png')} className='w-96 h-52 mx-auto'/>

                    <Text className='text-lg uppercase font-semibold my-2'>4 -{">"} Historique </Text>
                    <Image source={require('../assets/historique1.png')} className='w-96 h-52 mx-auto'/>

                </View>
               </ScrollView>
            </View>
        </View>

        );
    }