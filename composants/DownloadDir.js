import { Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

const DownloadDir = Platform.OS === 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir;

export { DownloadDir };
