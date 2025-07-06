import React, { useState, useEffect } from 'react';
import './Header.css';
import MenuIcon from '@material-ui/icons/Menu';
import { Avatar, IconButton, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AppsIcon from '@material-ui/icons/Apps';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useDispatch, useSelector } from 'react-redux';
import { logout, login, selectUser } from './features/userSlice';
import { getUser, signIn, signOut as gapiSignOut } from './utils/googleAuth';

function Header({ onToggleSidebar, onSearch, query = '' }) {
  const user = useSelector(selectUser);
  const [searchInput, setSearchInput] = useState(query);
  const dispatch = useDispatch();

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchInput);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleLogin = async () => {
    try {
      await signIn();
      const currentUser = getUser();
      const profile = currentUser.getBasicProfile();
      dispatch(
        login({
          displayName: profile.getName(),
          email: profile.getEmail(),
          photoUrl: profile.getImageUrl(),
        }),
      );
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  const handleLogout = () => {
    gapiSignOut();
    dispatch(logout());
  };

  return (
    <div className='header'>
      <div className='header__left'>
        <IconButton onClick={onToggleSidebar}>
          <MenuIcon />
        </IconButton>
        <img
          src='https://i.pinimg.com/originals/ae/47/fa/ae47fa9a8fd263aa364018517020552d.png'
          alt='Gmail Clone Logo'
        />
      </div>

      <div className='header__middle'>
        <SearchIcon className='SearchIcon' onClick={handleSearch} />
        <input
          placeholder='Search mail'
          type='text'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className='header__right'>
        <IconButton>
          <AppsIcon />
        </IconButton>
        <IconButton>
          <NotificationsIcon />
        </IconButton>

        {user ? (
          <Avatar onClick={handleLogout} src={user?.photoUrl} />
        ) : (
          <Button variant='outlined' size='small' onClick={handleLogin}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
}

export default Header;
