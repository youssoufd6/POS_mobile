import { useEffect, useState } from "react"
import { View, Text,ActivityIndicator,ScrollView, TouchableOpacity,FlatList  } from "react-native"
import { CommandManager } from "../DataBase/CommandManager"
import tw from 'twrnc'

export const Recu = ({commande}) => {
    const [loading, setLoading] = useState(false)
    const [ligneDeCommandes,SetLigneDeCommandes ] = useState([]);



    useEffect(()=>{
      setLoading(true)
        CommandManager.selectLDCMDStockeesById(commande.id)
        .then(res=>{
            SetLigneDeCommandes(res);
            setLoading(false)
        })
        
    }, [commande.id])

    const imprimer = async () =>
    {
    
    }

    const renderItem = ({ item }) => (
      <View key={item.id} className="">
        <Text className="text-sm">{item.nom_produit}</Text>
        <Text className="text-sm">
          {item.quantite} x {item.prix_produit} = {item.total} GNF
        </Text>
      </View>
    );

    return(
      
        <View className="p-2  bg-white rounded-xl  my-auto">
            <View className="flex justify-between items-center mb-4">
                <Text className="text-xl font-semibold">#{commande.id}</Text>
                <View className="flex items-center">
                  <Text className="text-[#27AE60]">{commande.date}</Text>
                </View>
              <Text className="text-2xl font-bold">{commande.total} GNF</Text>
              
            </View>
            <View className="mb-4">
              <Text className="text-sm">Caissier: vendeur</Text>
              <Text className="text-sm">PDV: POS 2</Text>
            </View>
              
                  <View className="mb-4">
                    <FlatList
                    className='mb-3'
                        data={ligneDeCommandes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                      />
                  </View>
              
           
            {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white bg-opacity-50">
          <ActivityIndicator size="large" color="#27AE60" />
          <Text className="text-greeen-700">Patientez...</Text>
        </View>
      )}
            <View className="flex justify-between">
              <Text className="text-sm">Total</Text>
              <Text className="text-sm font-bold">{commande.total} GNF</Text>
            </View>
            <View className="flex justify-between items-center mt-4">
              <Text className="text-sm">{commande.date}</Text>
              <Text className="text-sm">#{commande.id}</Text>
            </View>
            {/** 
            <TouchableOpacity className='bg-orange-500 mx-auto p-2 rounded-lg' onPress={imprimer}>
                <Text className='text-center font-bold uppercase text-white'>Imprimer</Text>
            </TouchableOpacity>
            */}
          </View>
         
    )
}