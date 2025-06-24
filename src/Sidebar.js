import { Button } from '@material-ui/core';
import React from 'react';
import './Sidebar.css';
import CreateIcon from '@material-ui/icons/Create';
import InboxIcon from '@material-ui/icons/Inbox';
import SidebarOption from './SidebarOption';
import StarIcon from '@material-ui/icons/Star';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';
import NearMeIcon from '@material-ui/icons/NearMe';
import NoteIcon from '@material-ui/icons/Note';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useDispatch } from 'react-redux';
import { openSendMessage } from './features/mailSlice';

function Sidebar() {
  const dispatch = useDispatch();

  return (
    <div className='sidebar'>
      <Button
        startIcon={<CreateIcon fontSize='large' />}
        className='sidebar__compose'
        onClick={() => dispatch(openSendMessage())}
      >
        Compose
      </Button>

      <SidebarOption Icon={InboxIcon} title='Inbox' number={1} selected={true} />
      <SidebarOption Icon={StarIcon} title='Starred' number={1} />
      <SidebarOption Icon={AccessTimeIcon} title='Snoozed' number={1} />
      <SidebarOption Icon={LabelImportantIcon} title='Important' number={1} />
      <SidebarOption Icon={NearMeIcon} title='Sent' number={1} />
      <SidebarOption Icon={NoteIcon} title='Drafts' number={1} />
      <SidebarOption Icon={ExpandMoreIcon} title='More' number={1} />
    </div>
  );
}

export default Sidebar;
