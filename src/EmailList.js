import React, { useEffect, useState } from 'react';
import { Checkbox, IconButton } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import RefreshIcon from '@material-ui/icons/Refresh';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SettingsIcon from '@material-ui/icons/Settings';
import Info from '@material-ui/icons/Info';
import ForumIcon from '@material-ui/icons/Forum';
import KeyboardHideIcon from '@material-ui/icons/KeyboardHide';
import InboxIcon from '@material-ui/icons/Inbox';
import PeopleIcon from '@material-ui/icons/People';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import './EmailList.css';
import Section from './Section';
import EmailRow from './EmailRow';
import { db } from './firebase';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

function EmailList({ toggleTheme }) {
  const [emails, setEmails] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const unsubscribe = db
      .collection('emails')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) =>
        setEmails(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          })),
        ),
      );
    return () => unsubscribe(); // clean up listener
  }, []);

  return (
    <div className='emailList'>
      <div className='emailList__settings'>
        <div className='emailList__settingsLeft'>
          <Checkbox />
          <IconButton>
            <ArrowDropDownIcon />
          </IconButton>
          <IconButton>
            <RefreshIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
        <div className='emailList__settingsRight'>
          <IconButton>
            <KeyboardHideIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen}>
            <SettingsIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                toggleTheme();
                handleMenuClose();
              }}
            >
              Change Theme
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          </Menu>
        </div>
      </div>

      <div className='emailList__sections'>
        <Section Icon={InboxIcon} title='Primary' color='red' selected />
        <Section Icon={LocalOfferIcon} title='Promotions' color='green' />
        <Section Icon={PeopleIcon} title='Social' color='#1A73E8' />
        <Section Icon={Info} title='Updates' color='green' />
        <Section Icon={ForumIcon} title='Forms' color='green' />
      </div>

      <div className='emailList__list'>
        {emails.map(({ id, data: { to, subject, message, timestamp } }) => (
          <EmailRow
            key={id}
            id={id}
            title={to}
            subject={subject}
            description={message}
            time={timestamp ? new Date(timestamp.seconds * 1000).toUTCString() : ''}
          />
        ))}
      </div>
    </div>
  );
}

export default EmailList;
