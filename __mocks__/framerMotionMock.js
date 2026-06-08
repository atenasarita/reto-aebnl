import React from 'react';

export const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
export const motion = {
  div: ({ children, ...props }) => React.createElement('div', props, children),
  p: ({ children, ...props }) => React.createElement('p', props, children),
  span: ({ children, ...props }) => React.createElement('span', props, children),
};