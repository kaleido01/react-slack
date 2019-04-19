import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
	apiKey: "AIzaSyAMBHghFsECDq1Rl9rPZMlKnWC_pxxf1PQ",
	authDomain: "react-slack-clone-46d29.firebaseapp.com",
	databaseURL: "https://react-slack-clone-46d29.firebaseio.com",
	projectId: "react-slack-clone-46d29",
	storageBucket: "react-slack-clone-46d29.appspot.com",
	messagingSenderId: "358126071821"
};
firebase.initializeApp(config);

export default firebase;
