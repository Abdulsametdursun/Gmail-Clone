import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { IconButton } from '@material-ui/core';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';
import LabelImportantOutlinedIcon from '@material-ui/icons/LabelImportantOutlined';
import './EmailRow.css';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { selectMail, openSendMessage, setDraft } from './features/mailSlice';

function EmailRow({ id, title, subject, description, time, folder, read, selected, onSelect }) {
  const history = useHistory();
  const dispatch = useDispatch();

  const openMail = () => {
    if (folder === 'drafts') {
      dispatch(
        setDraft({
          id,
          to: title,
          subject,
          message: description,
        }),
      );
      dispatch(openSendMessage());
    } else {
      dispatch(
        selectMail({
          id,
          title,
          subject,
          description,
          time,
          folder,
        }),
      );
      history.push('/mail');
    }
  };

  return (
    <div
      onClick={openMail}
      className={`emailRow ${!read ? 'emailRow--unread' : ''} ${
        selected ? 'emailRow--selected' : ''
      }`}
    >
      <div className='emailRow__options'>
        <Checkbox
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onSelect(id)}
        />
        <IconButton onClick={(e) => e.stopPropagation()}>
          <StarBorderOutlinedIcon />
        </IconButton>
        <IconButton onClick={(e) => e.stopPropagation()}>
          <LabelImportantOutlinedIcon />
        </IconButton>
      </div>

      <h3 className='emailRow__title'>{title}</h3>

      <div className='emailRow__message'>
        <h4>
          {subject} <span className='emailRow__description'>- {description}</span>
        </h4>
      </div>

      <p className='emailRow__time'>{time}</p>
    </div>
  );
}

export default EmailRow;
