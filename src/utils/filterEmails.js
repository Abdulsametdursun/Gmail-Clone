export default function filterEmails(emails = [], folder, category) {
  const folderMap = {
    inbox: 'Inbox',
    starred: 'Starred',
    snoozed: 'Snoozed',
    sent: 'Sent',
    drafts: 'Drafts',
    spam: 'Spam',
    trash: 'Trash',
    important: 'Important',
  };

  return emails
    .filter((email) => {
      if (!folder || folder === 'all') return true;

      const label = folderMap[folder];
      const hasLabel = label && email.labels?.includes(label);

      switch (folder) {
        case 'starred':
          return hasLabel || email.isStarred || email.folder === 'starred';
        case 'snoozed':
          return hasLabel || email.isSnoozed || email.folder === 'snoozed';
        case 'drafts':
          return hasLabel || email.isDraft || email.folder === 'drafts';
        case 'trash':
          return hasLabel || email.isTrash || email.folder === 'trash';
        default:
          return email.folder === folder || hasLabel;
      }
    })
    .filter((email) => (category ? email.category === category : true));
}
