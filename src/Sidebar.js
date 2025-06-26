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

function Sidebar() {
  const dispatch = useDispatch();
  const [emails, setEmails] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const unsubscribe = db.collection('emails').onSnapshot((snapshot) =>
      setEmails(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })),
      ),
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className='sidebar'>
      <Button
        startIcon={<CreateIcon fontSize='large' />}
        className='sidebar__compose'
        onClick={() => dispatch(openSendMessage())}
      >
        Compose
      </Button>

      <SidebarOption Icon={InboxIcon} title='Inbox' number={emails.length} path='/' />
      <SidebarOption Icon={StarIcon} title='Starred' number={0} path='/starred' />
      <SidebarOption Icon={AccessTimeIcon} title='Snoozed' number={0} path='/snoozed' />
      <SidebarOption Icon={NearMeIcon} title='Sent' number={0} path='/sent' />
      <SidebarOption Icon={NoteIcon} title='Drafts' number={0} path='/drafts' />

      <SidebarOption
        Icon={showMore ? ExpandLessIcon : ExpandMoreIcon}
        title='More'
        number={0}
        onClick={() => setShowMore(!showMore)}
      />

      {showMore && (
        <>
          <SidebarOption
            Icon={LabelImportantIcon}
            title='Important'
            number={0}
            path='/important'
            nested
          />
          <SidebarOption Icon={MailIcon} title='All Mail' number={0} path='/all' nested />
          <SidebarOption Icon={ReportIcon} title='Spam' number={0} path='/spam' nested />
          <SidebarOption Icon={DeleteIcon} title='Trash' number={0} path='/trash' nested />
        </>
      )}
    </div>
  );
}

export default Sidebar;
