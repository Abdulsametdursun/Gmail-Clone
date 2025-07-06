import React, { useEffect } from 'react';
import './SendMail.css';
import CloseIcon from '@material-ui/icons/Close';
import { Button } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { closeSendMessage, selectDraft, clearDraft } from './features/mailSlice';
import { saveDraft, deleteDraft } from './utils/draftStorage';
import { selectUser } from './features/userSlice';
import { sendEmail as sendGmailEmail } from './utils/gmailApi';

function SendMail() {
  const draft = useSelector(selectDraft);
  const user = useSelector(selectUser);
  const { register, handleSubmit, errors, reset } = useForm({
    defaultValues: draft || {},
  });
  const dispatch = useDispatch();

  useEffect(() => {
    reset(draft || {});
  }, [draft, reset]);

  const onSubmit = async (formData) => {
    console.log(formData);

    // If we have an OAuth token, also send the email using Gmail API
    if (user?.token) {
      try {
        await sendGmailEmail(user.token, {
          to: formData.to,
          subject: formData.subject,
          message: formData.message,
        });
        alert('Email sent successfully!');
      } catch (e) {
        alert('Failed to send email');
        console.error('Failed to send via Gmail API', e);
        return;
      }
    } else {
      alert('Failed to send email: No OAuth token');
      return;
    }

    if (draft?.id) {
      await deleteDraft(draft.id);
    }

    dispatch(clearDraft());
    dispatch(closeSendMessage());
  };

  const onSaveDraft = async (formData) => {
    const result = await saveDraft({
      id: draft?.id,
      to: formData.to,
      subject: formData.subject,
      message: formData.message,
    });
    dispatch(clearDraft());
    dispatch(closeSendMessage());
  };

  return (
    <div className='sendMail'>
      <div className='sendMail__header'>
        <h3>New Message</h3>
        <CloseIcon onClick={() => dispatch(closeSendMessage())} className='sendMail__close' />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input name='to' placeholder='To' type='email' ref={register({ required: true })} />
        {errors.to && <p className='sendMail__error'>To is Required!</p>}

        <input
          name='subject'
          placeholder='Subject'
          type='text'
          ref={register({ required: true })}
        />
        {errors.subject && <p className='sendMail__error'>Subject is Required!</p>}

        <input
          name='message'
          placeholder='Message...'
          type='text'
          className='sendMail__message'
          ref={register({ required: true })}
        />
        {errors.message && <p className='sendMail__error'>Message is Required!</p>}

        <div className='sendMail__options'>
          <Button className='sendMail__send' variant='contained' color='primary' type='submit'>
            Send
          </Button>
          <Button
            className='sendMail__draft'
            variant='contained'
            style={{ backgroundColor: '#f4b400', color: '#000' }}
            onClick={handleSubmit(onSaveDraft)}
          >
            Draft
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SendMail;
