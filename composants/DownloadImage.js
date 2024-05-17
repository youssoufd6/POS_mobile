import { Alert, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { DownloadDir } from './DownloadDir';




export const DownloadImage = {
   
    //la fonction de telechargement d'image a partir de l'API
     downloadAndCopyImage : async (sourcePath, destinationPath) => {
      try {
        const response = await RNFetchBlob.config({
          // la recuperation du fichier avec la requete GET à partir de la source
        }).fetch('GET', sourcePath);
    
        // Vérifiez si le répertoire est défini avant d'utiliser DocumentDir
        if (!DownloadDir) {
          Alert.alert('Erreur: Impossible de déterminer le répertoire de téléchargement.');
          return;
        }
    
        // Continuer avec le traitement
        const imagePath = `${DownloadDir}/${destinationPath}`;
        await RNFetchBlob.fs.writeFile(imagePath, response.data, 'base64');
        console.log('Image téléchargée et sauvegardée avec succès');
      } catch (error) {
        console.log('Erreur lors du téléchargement et de la sauvegarde de l\'image :', error);
      }
    },
}