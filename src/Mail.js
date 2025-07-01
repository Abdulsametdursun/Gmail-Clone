import React from 'react';
import './Mail.css';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
import StarIcon from '@material-ui/icons/Star';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PrintIcon from '@material-ui/icons/Print';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectOpenMail, selectMail } from './features/mailSlice';
import { db } from './firebase';

function Mail() {
  const history = useHistory();
  const dispatch = useDispatch();
  const selectedMail = useSelector(selectOpenMail);

  const moveEmailTo = (folder) => {
    if (selectedMail?.id) {
      db.collection('emails').doc(selectedMail.id).update({ folder });
    }
    const path = folder === 'inbox' ? '/' : `/${folder}`;
    history.push(path);
  };

  const navigateEmail = async (direction) => {
    const snapshot = await db.collection('emails').orderBy('timestamp', 'desc').get();
    const emails = snapshot.docs
      .map((doc) => ({ id: doc.id, data: doc.data() }))
      .filter((email) => email.data.folder === selectedMail?.folder);

    const index = emails.findIndex((email) => email.id === selectedMail?.id);
    const nextIndex = direction === 'next' ? index + 1 : index - 1;

    if (nextIndex >= 0 && nextIndex < emails.length) {
      const next = emails[nextIndex];
      dispatch(
        selectMail({
          id: next.id,
          title: next.data.to,
          subject: next.data.subject,
          description: next.data.message,
          time: next.data.timestamp
            ? new Date(next.data.timestamp.seconds * 1000).toUTCString()
            : '',
          folder: next.data.folder,
        }),
      );
    }
  };

  const printEmail = () => window.print();
  const openInNewTab = () => window.open(window.location.href, '_blank');

  return (
    <div className='mail'>
      <div className='mail__tools'>
        <div className='mail__toolsLeft'>
          <IconButton
            onClick={() =>
              history.push(selectedMail?.folder === 'inbox' ? '/' : `/${selectedMail?.folder}`)
            }
          >
            <ArrowBackIcon />
          </IconButton>

          <IconButton onClick={() => moveEmailTo('inbox')}>
            <MoveToInboxIcon />
          </IconButton>

          <IconButton onClick={() => moveEmailTo('starred')}>
            <StarIcon />
          </IconButton>

          <IconButton onClick={() => moveEmailTo('snoozed')}>
            <WatchLaterIcon />
          </IconButton>

          <IconButton onClick={() => moveEmailTo('important')}>
            <LabelImportantIcon />
          </IconButton>

          <IconButton onClick={() => moveEmailTo('spam')}>
            <ErrorIcon />
          </IconButton>

          <IconButton onClick={() => moveEmailTo('trash')}>
            <DeleteIcon />
          </IconButton>
        </div>

        <div className='mail__toolsRight'>
          <IconButton onClick={() => navigateEmail('prev')}>
            <ChevronLeftIcon />
          </IconButton>

          <IconButton onClick={() => navigateEmail('next')}>
            <ChevronRightIcon />
          </IconButton>

          <IconButton onClick={printEmail}>
            <PrintIcon />
          </IconButton>

          <IconButton onClick={openInNewTab}>
            <ExitToAppIcon />
          </IconButton>
        </div>
      </div>
      <div className='mail__body'>
        <div className='mail__bodyHeader'>
          <h2>{selectedMail?.subject}</h2>
          <LabelImportantIcon className='mail__important' />
          <p>{selectedMail?.title}</p>
          <p className='mail__time'>{selectedMail?.time}</p>
        </div>

        <div className='mail__message'>
          <p>{selectedMail?.description}</p>
        </div>
      </div>
    </div>
  );
}

export default Mail;
