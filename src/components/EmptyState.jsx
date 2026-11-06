import React from 'react';
import { BookOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  action = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
