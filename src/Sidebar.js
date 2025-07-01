import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import CreateIcon from '@material-ui/icons/Create';
import InboxIcon from '@material-ui/icons/Inbox';
import StarIcon from '@material-ui/icons/Star';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';
import NearMeIcon from '@material-ui/icons/NearMe';
import NoteIcon from '@material-ui/icons/Note';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import MailIcon from '@material-ui/icons/Mail';
import ReportIcon from '@material-ui/icons/Report';
import DeleteIcon from '@material-ui/icons/Delete';
import SidebarOption from './SidebarOption';
import { useDispatch } from 'react-redux';
import { openSendMessage } from './features/mailSlice';
import { db } from './firebase';

function Sidebar({ collapsed }) {
  const dispatch = useDispatch();
  const [inboxCount, setInboxCount] = useState(0);
  const [spamCount, setSpamCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const unsubInbox = db
      .collection('emails')
      .where('folder', '==', 'inbox')
      .onSnapshot((snapshot) => setInboxCount(snapshot.size));

    const unsubSpam = db
      .collection('emails')
      .where('folder', '==', 'spam')
      .onSnapshot((snapshot) => setSpamCount(snapshot.size));

    const unsubTrash = db
      .collection('emails')
      .where('folder', '==', 'trash')
      .onSnapshot((snapshot) => setTrashCount(snapshot.size));

    const unsubAll = db.collection('emails').onSnapshot((snapshot) => setAllCount(snapshot.size));

    return () => {
      unsubInbox();
      unsubSpam();
      unsubTrash();
      unsubAll();
    };
  }, []);

  return (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <Button
        startIcon={<CreateIcon fontSize='large' />}
        className='sidebar__compose'
        onClick={() => dispatch(openSendMessage())}
      >
        <span className='sidebar__composeText'>Compose</span>
      </Button>

      <SidebarOption
        collapsed={collapsed}
        Icon={InboxIcon}
        title='Inbox'
        number={inboxCount}
        path='/'
      />
      <SidebarOption
        collapsed={collapsed}
        Icon={StarIcon}
        title='Starred'
        number={0}
        path='/starred'
      />
      <SidebarOption
        collapsed={collapsed}
        Icon={AccessTimeIcon}
        title='Snoozed'
        number={0}
        path='/snoozed'
      />
      <SidebarOption collapsed={collapsed} Icon={NearMeIcon} title='Sent' number={0} path='/sent' />
      <SidebarOption
        collapsed={collapsed}
        Icon={NoteIcon}
        title='Drafts'
        number={0}
        path='/drafts'
      />

      <SidebarOption
        Icon={showMore ? ExpandLessIcon : ExpandMoreIcon}
        title='More'
        number={0}
        onClick={() => setShowMore(!showMore)}
        collapsed={collapsed}
      />

      {showMore && (
        <>
          <SidebarOption
            Icon={LabelImportantIcon}
            title='Important'
            number={0}
            path='/important'
            nested
            collapsed={collapsed}
          />
          <SidebarOption
            collapsed={collapsed}
            Icon={MailIcon}
            title='All Mail'
            number={allCount}
            path='/all'
            nested
          />
          <SidebarOption
            collapsed={collapsed}
            Icon={ReportIcon}
            title='Spam'
            number={spamCount}
            path='/spam'
            nested
          />
          <SidebarOption
            collapsed={collapsed}
            Icon={DeleteIcon}
            title='Trash'
            number={trashCount}
            path='/trash'
            nested
          />
        </>
      )}
    </div>
  );
}

export default Sidebar;
