import React, { Suspense } from 'react';

import './App.css';
import "bulma/css/bulma.css"

import { FirebaseAppProvider, AuthCheck, useAuth, useFirestore, useFirestoreCollectionData, useUser } from "reactfire";
import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyByxwJohw2Gqd_I57t8PmGvP5ZqoKH5x8U",
  authDomain: "react-game-lobby.firebaseapp.com",
  databaseURL: "https://react-game-lobby.firebaseio.com",
  projectId: "react-game-lobby",
  storageBucket: "react-game-lobby.appspot.com",
  messagingSenderId: "11565285770",
  appId: "1:11565285770:web:334779ae721dc0d84b4873",
  measurementId: "G-RRHGL0NVCH"
};

function AuthButtons(){

  const auth = useAuth();
  /*const signIn = async () => {
    await auth.signInWithPopup( new firebase.auth.GoogleAuthProvider() );
  };
  const signOut = async () => {
    await auth.signOut();
  };*/
  return(
    <AuthCheck
      fallback={
        <button id="SignInAuthButton" className="button is-dark signIn" onClick={
          async (e) => {await auth.signInWithPopup( new firebase.auth.GoogleAuthProvider() )}
        }>
          Sign In <img id="GoogleLogo" width="32" src="https://img.icons8.com/color/48/000000/google-logo.png"/>
        </button>
      }
    >

      <button className="button is-outlined signOut" onClick={
        async (e) => {await auth.signOut() }
        }>Sign Out</button>
    </AuthCheck>
  );
}

function Navbar(){
  return(
    <nav className="navbar">
      <div className="navbar-brand fireLobby">Fire Lobby <span role="img" aria-label="fire">🔥</span></div>
      <div className="navbar-menu">
        <div className="navbar-start"></div>
        <div className="navbar-end">
          <div className="navbar-items">
            <div><AuthButtons /></div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Lobby(){
  const { email, displayName, uid } = useUser();
  const lobbyCollection = useFirestore().collection("lobby");
  const lobby = useFirestoreCollectionData(lobbyCollection);

  const userInLobby = lobby.find(m => m.email === email);

  const joinLobby = async () => {
    await lobbyCollection.doc(uid).set({ email, displayName, ready: false });
  };

  const leaveLobby = async () => {
    await lobbyCollection.doc(uid).delete();
  };

  const toggleReadiness = async newReadiness => {
    await lobbyCollection.doc(uid).set({ ready: newReadiness }, { merge: true });
  };

  return(
    <div className="container is-fluid">
      {
        lobby.map(m => {
          return(
            <article key={m.email} className="title is-child notification">
              <p className="title">
                {m.displayName} - {m.ready ? "Ready 🎮" : "Not Ready ❌"}
              </p>
            </article>
          );
        })
      }
      <div className="columns">
        {
          userInLobby && (
            <div className="column is-1">
              <button className="button is=primary" onClick={() => toggleReadiness(!userInLobby.ready)}>
                {userInLobby.ready ? "Not Ready" : "Ready"}
              </button>
            </div>
          )
        }
        <div className="column is-1">
          {userInLobby ? (
            <button className="button is-primary" onClick={leaveLobby}>Leave</button>
          ) : (
            <button className="button is-primary" onClick={joinLobby}>Join</button>
          )}
        </div>
      </div>

    </div>
  );
}

function App() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Suspense fallback={<p>Loading...</p>}>
        <Navbar />
        <AuthCheck fallback={<p>Not Logged In...</p>}>
          <Lobby />
        </AuthCheck>
        <div>Hello World! <span role="img" aria-label="globe">🌎</span></div>
      </Suspense>
    </FirebaseAppProvider>
    
  );
}

export default App;
