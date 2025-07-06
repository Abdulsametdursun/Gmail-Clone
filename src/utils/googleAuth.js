import { gapi } from 'gapi-script';

const CLIENT_ID = '853312377808-jscf163qd8mgs6u0g09cbkm127htmlrb.apps.googleusercontent.com ';
const SCOPES =
  'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export const initGapiClient = () => {
  return new Promise((resolve) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        })
        .then(() => resolve());
    });
  });
};

export const signIn = () => gapi.auth2.getAuthInstance().signIn();
export const signOut = () => gapi.auth2.getAuthInstance().signOut();
export const getUser = () => gapi.auth2.getAuthInstance().currentUser.get();
