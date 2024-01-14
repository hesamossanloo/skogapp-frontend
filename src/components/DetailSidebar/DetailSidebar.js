/* eslint-disable react/prop-types */
// DetailSidebar.js
import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  drawer: {
    '& .MuiDrawer-paper': {
      height: '40vh',
    },
  },
});

function DetailSidebar({ open, onClose, info }) {
  const classes = useStyles();

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      variant="persistent"
      className={classes.drawer}
    >
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
