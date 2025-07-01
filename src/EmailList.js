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
import filterEmails from './utils/filterEmails';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import VirtualKeyboard from './VirtualKeyboard';

function EmailList({ toggleTheme, folder = 'inbox' }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Primary');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [optionsAnchor, setOptionsAnchor] = useState(null);
  const optionsOpen = Boolean(optionsAnchor);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleOptionsOpen = (event) => setOptionsAnchor(event.currentTarget);
  const handleKeyboardOpen = () => setShowKeyboard((prev) => !prev);
  const handleKeyboardClose = () => setShowKeyboard(false);
  const handleMenuClose = () => setAnchorEl(null);
  const handleOptionsClose = () => setOptionsAnchor(null);

  const toggleSelectEmail = (id) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedEmails(emails.map((email) => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const markAsRead = () => {
    selectedEmails.forEach((id) => {
      db.collection('emails').doc(id).update({ read: true });
    });
    setSelectedEmails([]);
  };

  const markAsUnread = () => {
    selectedEmails.forEach((id) => {
      db.collection('emails').doc(id).update({ read: false });
    });
    setSelectedEmails([]);
  };

  const deleteSelected = () => {
    selectedEmails.forEach((id) => {
      db.collection('emails').doc(id).update({ folder: 'trash' });
    });
    setSelectedEmails([]);
  };

  const fetchEmails = () => {
    db.collection('emails')
      .orderBy('timestamp', 'desc')
      .get()
      .then((snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        const filtered = filterEmails(
          items.map((e) => ({ id: e.id, ...e.data })),
          folder,
          selectedTab,
        );
        setEmails(filtered.map((e) => ({ id: e.id, data: { ...e } })));
      });
  };

  useEffect(() => {
    fetchEmails();
  }, [folder, selectedTab]);

  return (
    <div className='emailList'>
      <div className='emailList__settings'>
        <div className='emailList__settingsLeft'>
          <Checkbox
            indeterminate={selectedEmails.length > 0 && selectedEmails.length < emails.length}
            checked={emails.length > 0 && selectedEmails.length === emails.length}
            onChange={handleSelectAllChange}
          />
          <IconButton>
            <ArrowDropDownIcon />
          </IconButton>
          <IconButton onClick={fetchEmails}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleOptionsOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={optionsAnchor} open={optionsOpen} onClose={handleOptionsClose}>
            <MenuItem
              onClick={() => {
                markAsRead();
                handleOptionsClose();
              }}
            >
              Mark as read
            </MenuItem>
            <MenuItem
              onClick={() => {
                markAsUnread();
                handleOptionsClose();
              }}
            >
              Mark as unread
            </MenuItem>
            <MenuItem
              onClick={() => {
                deleteSelected();
                handleOptionsClose();
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>
        <div className='emailList__settingsRight'>
          <IconButton onClick={handleKeyboardOpen}>
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
        <Section
          Icon={InboxIcon}
          title='Primary'
          color='red'
          selected={selectedTab === 'Primary'}
          onClick={() => setSelectedTab('Primary')}
        />
        <Section
          Icon={LocalOfferIcon}
          title='Promotions'
          color='green'
          selected={selectedTab === 'Promotions'}
          onClick={() => setSelectedTab('Promotions')}
        />
        <Section
          Icon={PeopleIcon}
          title='Social'
          color='blue'
          selected={selectedTab === 'Social'}
          onClick={() => setSelectedTab('Social')}
        />
        <Section
          Icon={Info}
          title='Updates'
          color='purple'
          selected={selectedTab === 'Updates'}
          onClick={() => setSelectedTab('Updates')}
        />
        <Section
          Icon={ForumIcon}
          title='Forms'
          color='orange'
          selected={selectedTab === 'Forms'}
          onClick={() => setSelectedTab('Forms')}
        />
      </div>

      {showKeyboard && <VirtualKeyboard onClose={handleKeyboardClose} />}

      <div className='emailList__list'>
        {emails.length === 0 ? (
          <div className='emailList__empty'>No emails to display</div>
        ) : (
          emails.map(
            ({ id, data: { to, subject, message, timestamp, folder: mailFolder, read } }) => (
              <EmailRow
                key={id}
                id={id}
                title={to}
                subject={subject}
                description={message}
                time={timestamp ? new Date(timestamp.seconds * 1000).toUTCString() : ''}
                folder={mailFolder}
                read={read}
                selected={selectedEmails.includes(id)}
                onSelect={toggleSelectEmail}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

export default EmailList;
