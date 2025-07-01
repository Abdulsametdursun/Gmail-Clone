import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './Header';
import Sidebar from './Sidebar';
import Mail from './Mail';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import EmailList from './EmailList';
import SendMail from './SendMail';
import { useDispatch, useSelector } from 'react-redux';
import { selectSendMessageIsOpen } from './features/mailSlice';
import { login, selectUser } from './features/userSlice';
import Login from './Login';
import { auth } from './firebase';

function App() {
  const sendMessageIsOpen = useSelector(selectSendMessageIsOpen);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [darkTheme, setDarkTheme] = useState(false);

  const toggleTheme = () => setDarkTheme((prev) => !prev);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(
          login({
            displayName: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          }),
        );
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      {!user ? (
        <Login />
      ) : (
        <div className={`app ${darkTheme ? 'dark-theme' : 'light-theme'}`}>
          <Header />
          <div className='app__body'>
            <Sidebar />
            <Switch>
              <Route path='/mail'>
                <Mail />
              </Route>
              <Route path='/all'>
                <EmailList toggleTheme={toggleTheme} folder='all' />
              </Route>
              <Route path='/spam'>
                <EmailList toggleTheme={toggleTheme} folder='spam' />
              </Route>
              <Route path='/trash'>
                <EmailList toggleTheme={toggleTheme} folder='trash' />
              </Route>
              <Route path='/important'>
                <EmailList toggleTheme={toggleTheme} folder='important' />
              </Route>
              <Route exact path='/'>
                <EmailList toggleTheme={toggleTheme} folder='inbox' />
              </Route>
            </Switch>
          </div>
          {sendMessageIsOpen && <SendMail />}
        </div>
      )}
    </Router>
  );
}

export default App;
