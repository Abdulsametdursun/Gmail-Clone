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
import { initGapiClient, getUser } from './utils/googleAuth';

function App() {
  const sendMessageIsOpen = useSelector(selectSendMessageIsOpen);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [darkTheme, setDarkTheme] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleTheme = () => setDarkTheme((prev) => !prev);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initGapiClient().then(() => {
      const user = getUser();
      if (user && user.isSignedIn()) {
        const profile = user.getBasicProfile();
        dispatch(
          login({
            displayName: profile.getName(),
            email: profile.getEmail(),
            photoUrl: profile.getImageUrl(),
          }),
        );
      }
    });
  }, [dispatch]);

  return (
    <Router>
      {!user ? (
        <Login />
      ) : (
        <div className={`app ${darkTheme ? 'dark-theme' : 'light-theme'}`}>
          <Header onToggleSidebar={toggleSidebar} onSearch={setSearchQuery} query={searchQuery} />
          <div className='app__body'>
            <Sidebar collapsed={sidebarCollapsed} />
            <Switch>
              <Route path='/mail'>
                <Mail />
              </Route>
              <Route path='/starred'>
                <EmailList toggleTheme={toggleTheme} folder='starred' searchQuery={searchQuery} />
              </Route>
              <Route path='/snoozed'>
                <EmailList toggleTheme={toggleTheme} folder='snoozed' searchQuery={searchQuery} />
              </Route>
              <Route path='/sent'>
                <EmailList toggleTheme={toggleTheme} folder='sent' searchQuery={searchQuery} />
              </Route>
              <Route path='/drafts'>
                <EmailList toggleTheme={toggleTheme} folder='drafts' searchQuery={searchQuery} />
              </Route>
              <Route path='/all'>
                <EmailList toggleTheme={toggleTheme} folder='all' searchQuery={searchQuery} />
              </Route>
              <Route path='/spam'>
                <EmailList toggleTheme={toggleTheme} folder='spam' searchQuery={searchQuery} />
              </Route>
              <Route path='/trash'>
                <EmailList toggleTheme={toggleTheme} folder='trash' searchQuery={searchQuery} />
              </Route>
              <Route path='/important'>
                <EmailList toggleTheme={toggleTheme} folder='important' searchQuery={searchQuery} />
              </Route>
              <Route exact path='/'>
                <EmailList toggleTheme={toggleTheme} folder='inbox' searchQuery={searchQuery} />
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
