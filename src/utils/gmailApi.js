export const fetchGmailMessages = async (accessToken, labelIds = []) => {
  try {
    const params = new URLSearchParams({ maxResults: '25' });
    labelIds.forEach((id) => params.append('labelIds', id));
    if (labelIds.includes('SPAM') || labelIds.includes('TRASH')) {
      params.append('includeSpamTrash', 'true');
    }

    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const listData = await listRes.json();

    if (!listRes.ok) {
      console.error('Gmail fetch error:', listData);
      throw new Error(listData.error?.message || 'Failed to fetch messages');
    }

    const messageIds = listData.messages || [];

    const messages = await Promise.all(
      messageIds.map(async ({ id }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=To&metadataHeaders=From&metadataHeaders=Subject`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
        const getHeader = (name) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const labelIds = msg.labelIds || [];

        const folderMap = {
          INBOX: 'inbox',
          SENT: 'sent',
          DRAFT: 'drafts',
          SPAM: 'spam',
          TRASH: 'trash',
          IMPORTANT: 'important',
          STARRED: 'starred',
          SNOOZED: 'snoozed',
        };

        const categoryMap = {
          CATEGORY_PERSONAL: 'Primary',
          CATEGORY_PROMOTIONS: 'Promotions',
          CATEGORY_SOCIAL: 'Social',
          CATEGORY_UPDATES: 'Updates',
          CATEGORY_FORUMS: 'Forms',
        };

        const folderKey = Object.keys(folderMap).find((l) => labelIds.includes(l));
        const folder = folderKey ? folderMap[folderKey] : 'all';

        const categoryKey = Object.keys(categoryMap).find((l) => labelIds.includes(l));
        const category = categoryKey ? categoryMap[categoryKey] : '';

        return {
          id: msg.id,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          message: msg.snippet,
          timestamp: { seconds: Math.floor(parseInt(msg.internalDate, 10) / 1000) },
          folder,
          category,
          labels: labelIds,
          read: !labelIds.includes('UNREAD'),
        };
      }),
    );

    return messages;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    return [];
  }
};

export async function sendEmail(accessToken, { to, subject, message }) {
  const headers = [
    `To: ${to}`,
    'Content-Type: text/html; charset=UTF-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    message,
  ];

  const email = headers.join('\n');

  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64EncodedEmail }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Failed to send Gmail message', err);
    throw new Error(err.error?.message || 'Failed to send Gmail message');
  }

  return res.json();
}
