import React from 'react';
import './SendMail.css';
import CloseIcon from '@material-ui/icons/Close';
import { Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { closeSendMessage } from './features/mailSlice';
import { db } from './firebase';
import firebase from 'firebase';

function SendMail() {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    db.collection('emails').add({
      to: data.to,
      subject: data.subject,
      message: data.message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    dispatch(closeSendMessage());
  };

  return (
    <div className='sendMail'>
      <div className='sendMail__header'>
        <h3>New Message</h3>
        <CloseIcon onClick={() => dispatch(closeSendMessage())} className='sendMail__close' />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
        <input type='email' placeholder='To' {...register('to', { required: 'To is Required!' })} />
        {errors.to && <p className='sendMail__error'>{errors.to.message}</p>}

        <input
          type='text'
          placeholder='Subject'
          {...register('subject', { required: 'Subject is Required!' })}
        />
        {errors.subject && <p className='sendMail__error'>{errors.subject.message}</p>}

        <textarea
          placeholder='Message...'
          className='sendMail__message'
          {...register('message', { required: 'Message is Required!' })}
        />
        {errors.message && <p className='sendMail__error'>{errors.message.message}</p>}

        <div className='sendMail__options'>
          <Button className='sendMail__send' variant='contained' color='primary' type='submit'>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SendMail;
