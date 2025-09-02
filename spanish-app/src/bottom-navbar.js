import * as React from 'react';
import './App.css';

import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import { Settings } from '@mui/icons-material';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';

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
  const settings = 'Settings'




  return (
    <Box sx={{ width: "100%"}}>
      <BottomNavigation
        sx={{paddingBottom: '20px', backgroundColor: 'rgb(254, 254, 254)'}}
        showLabels
        value={value}
        onChange={(event, newValue) => {
            const dictionary = {
                "0": chapters,
                "1": store,
                "2": profile,
                "3": settings 
            };
            const valueName = dictionary[newValue]
            setValue(newValue);
            setSelection(valueName);

        }}
        classes="navbar-button-box"
      >
        <BottomNavigationAction  icon={<HomeFilledIcon sx={{fontSize: 40}}/>} />
        <BottomNavigationAction icon={<ShoppingBagIcon sx={{fontSize: 40}}/>} />
        <BottomNavigationAction  icon={<PersonIcon sx={{fontSize: 40}}/>} />
        <BottomNavigationAction  icon={<Settings sx={{fontSize: 40}}/>} />
      </BottomNavigation>
    </Box>
  );
}
