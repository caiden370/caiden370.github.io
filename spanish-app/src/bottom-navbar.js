import * as React from 'react';
import './App.css';

import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';

import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function BottomNavbar({setSelection}) {
  const [value, setValue] = React.useState(0);

  const chapters = 'Chapters';
  const store = 'Store';
  const profile = 'Profile';  




  return (
    <Box sx={{ width: "100%"}}>
      <BottomNavigation
        sx={{backgroundColor: '#dfe4ea'}}
        showLabels
        value={value}
        onChange={(event, newValue) => {
            const dictionary = {
                "0": chapters,
                "1": store,
                "2": profile
            };
            const valueName = dictionary[newValue]
            setValue(newValue);
            setSelection(valueName);

        }}
        classes="navbar-button-box"
      >
        <BottomNavigationAction label={chapters} icon={<SportsEsportsIcon/>} />
        <BottomNavigationAction label={store} icon={<ShoppingBagIcon/>} />
        <BottomNavigationAction label={profile} icon={<PersonIcon/>} />
      </BottomNavigation>
    </Box>
  );
}
