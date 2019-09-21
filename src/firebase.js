// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAl6Gw9PTfUdpsy9Pg4WMVLERhY9o5XVOQ",
  authDomain: "hackathon1-owais.firebaseapp.com",
  databaseURL: "https://hackathon1-owais.firebaseio.com",
  projectId: "hackathon1-owais",
  storageBucket: "hackathon1-owais.appspot.com",
  messagingSenderId: "528315504800",
  appId: "1:528315504800:web:af3d99b439ce663d0491c5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var storage = firebase.storage();

//login
async function loginwithFacebook() {
  var provider = new firebase.auth.FacebookAuthProvider();
  // console.log("owais");
  await firebase
    .auth()
    .signInWithPopup(provider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user, token);

      try {
        db.collection("userId")
          .doc(user.uid)
          .set({
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            avatar: user.photoURL
          })
          .then(() => {
            console.log("userid successfully written!");
          })
          .catch(e => {
            e.message;
          });
      } catch (error) {
        console.log(error);
      }
      Swal.fire("Successfully Loggedin!", "", "success").then(() => {});
      setTimeout(() => {
        location.assign("../pages/home.html");
      }, 2000);
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
    });
}

async function logOut() {
  try {
    var response = firebase.auth().signOut();
    // console.log(response);
    return response;
  } catch (e) {
    throw e;
  }
}
