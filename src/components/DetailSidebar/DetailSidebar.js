/* eslint-disable react/prop-types */
// DetailSidebar.js
import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

function DetailSidebar({ open, onClose, info }) {
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <List>
        <ListItem button onClick={onClose}>
          <ListItemText primary="Close" />
        </ListItem>
        {info &&
          Object.entries(info).map(([key, value], index) => (
            <ListItem key={index}>
              <ListItemText primary={key} secondary={value} />
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
}

export default DetailSidebar;
