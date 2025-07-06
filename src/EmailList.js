import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox, IconButton, Menu, MenuItem } from '@material-ui/core';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Forum as ForumIcon,
  KeyboardHide as KeyboardHideIcon,
  Inbox as InboxIcon,
  People as PeopleIcon,
  LocalOffer as LocalOfferIcon,
} from '@material-ui/icons';

import './EmailList.css';
import Section from './Section';
import EmailRow from './EmailRow';
import { db } from './firebase';
import filterEmails from './utils/filterEmails';
import { loadDrafts } from './utils/draftStorage';
import { fetchGmailMessages } from './utils/gmailApi';
import VirtualKeyboard from './VirtualKeyboard';
import { selectUser } from './features/userSlice';

function EmailList({ toggleTheme, folder = 'inbox', searchQuery = '' }) {
  const user = useSelector(selectUser);
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Primary');
  const [anchorEl, setAnchorEl] = useState(null);
  const [optionsAnchor, setOptionsAnchor] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleOptionsOpen = (e) => setOptionsAnchor(e.currentTarget);
  const handleOptionsClose = () => setOptionsAnchor(null);
  const toggleKeyboard = () => setShowKeyboard((prev) => !prev);

  const toggleSelectEmail = (id) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleSelectAllChange = (e) => {
    setSelectedEmails(e.target.checked ? emails.map((e) => e.id) : []);
  };

  const markAsRead = async () => {
    await Promise.all(
      selectedEmails.map((id) => db.collection('emails').doc(id).update({ read: true })),
    );
    setSelectedEmails([]);
    await fetchEmails();
  };

  const markAsUnread = async () => {
    await Promise.all(
      selectedEmails.map((id) => db.collection('emails').doc(id).update({ read: false })),
    );
    setSelectedEmails([]);
    await fetchEmails();
  };

  const deleteSelected = async () => {
    await Promise.all(
      selectedEmails.map(async (id) => {
        const doc = db.collection('emails').doc(id);
        const data = (await doc.get()).data();
        if (data.folder === 'trash') await doc.delete();
        else await doc.update({ folder: 'trash' });
      }),
    );
    setSelectedEmails([]);
    await fetchEmails();
  };

  const fetchEmails = async () => {
    try {
      let fetched = [];

      if (folder === 'inbox' && user?.token) {
        fetched = await fetchGmailMessages(user.token);
        fetched = fetched.map((msg) => ({
          id: msg.id,
          to: msg.from,
          subject: msg.subject,
          message: msg.snippet,
          timestamp: { seconds: Math.floor(Number(msg.internalDate) / 1000) },
          folder: 'inbox',
          read: true,
        }));
      } else if (folder === 'drafts') {
        fetched = await loadDrafts();
      } else {
        const snapshot = await db.collection('emails').orderBy('timestamp', 'desc').get();
        fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      const filtered = filterEmails(fetched, folder, selectedTab);
      const searchLower = searchQuery.toLowerCase();

      const searched = filtered.filter(
        (email) =>
          !searchLower ||
          email.subject?.toLowerCase().includes(searchLower) ||
          email.message?.toLowerCase().includes(searchLower) ||
          email.to?.toLowerCase().includes(searchLower) ||
          email.from?.toLowerCase().includes(searchLower),
      );

      setEmails(searched);
    } catch (err) {
      console.error('Email fetch error:', err);
      setEmails([]);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [folder, selectedTab, searchQuery, user?.token]);

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
          <Menu anchorEl={optionsAnchor} open={Boolean(optionsAnchor)} onClose={handleOptionsClose}>
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
          <IconButton onClick={toggleKeyboard}>
            <KeyboardHideIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen}>
            <SettingsIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
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
          Icon={InfoIcon}
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

      {showKeyboard && <VirtualKeyboard onClose={toggleKeyboard} />}

      <div className='emailList__list'>
        {emails.length === 0 ? (
          <div className='emailList__empty'>
            {searchQuery ? 'No emails found' : 'No emails to display'}
          </div>
        ) : (
          emails.map(({ id, to, subject, message, timestamp, folder: mailFolder, read }) => (
            <EmailRow
              key={id}
              id={id}
              title={to}
              subject={subject}
              description={message}
              time={timestamp?.seconds ? new Date(timestamp.seconds * 1000).toUTCString() : ''}
              folder={mailFolder}
              read={read}
              selected={selectedEmails.includes(id)}
              onSelect={toggleSelectEmail}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default EmailList;
