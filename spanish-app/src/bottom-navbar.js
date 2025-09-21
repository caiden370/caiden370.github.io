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

import { 
  UserCircle,
  Storefront,
  Gear,
  House,
} from 'phosphor-react';

export function removeAdScript() {
  const adScript = document.getElementById('ad-script');
  if (adScript) {
      adScript.remove(); // The .remove() method is a simple way to remove an element
      console.log("Ad script has been removed.");
  } else {
      console.log("Ad script not found.");
  }
};

export default function BottomNavbar({setSelection}) {
  const [value, setValue] = React.useState(0);

  const chapters = 'Chapters';
  const store = 'Store';
  const profile = 'Profile';  
  const settings = 'Settings'

  const Home = <House size={40} color={"rgb(0, 174, 255)"} weight={"duotone"} className={"drop-shadow-sm"} ></House>
  const Store = <Storefront size={40} color={"rgb(255, 0, 0)"} weight={"duotone"} className={"drop-shadow-sm"} ></Storefront>
  const Profile = <UserCircle size={40} color={"rgb(226, 123, 13)"} weight={"duotone"} className={"drop-shadow-sm"} ></UserCircle>
  const Settings =<Gear size={40} color={"rgb(117, 100, 100)"} weight={"duotone"} className={"drop-shadow-sm"} ></Gear>

  const SelectedHome = <House size={50} color={"rgb(0, 174, 255)"} weight={"duotone"} className={"drop-shadow-sm"} ></House>
  const SelectedStore = <Storefront size={50} color={"rgb(255, 0, 0)"} weight={"duotone"} className={"drop-shadow-sm"} ></Storefront>
  const SelectedProfile = <UserCircle size={50} color={"rgb(226, 123, 13)"} weight={"duotone"} className={"drop-shadow-sm"} ></UserCircle>
  const SelectedSettings =<Gear size={50} color={"rgb(117, 100, 100)"} weight={"duotone"} className={"drop-shadow-sm"} ></Gear>





  const dictionary = {
    "0": chapters,
    "1": store,
    "2": profile,
    "3": settings 
};
  return (
    <Box sx={{ width: "100%"}}>
      <BottomNavigation
        sx={{paddingBottom: '20px', backgroundColor:'inherit'}}
        showLabels
        value={value}
        onChange={(event, newValue) => {

            const valueName = dictionary[newValue]
            setValue(newValue);
            setSelection(valueName);
            removeAdScript();
        }}
        classes="navbar-button-box"
      >
        <BottomNavigationAction  icon={dictionary[value] === chapters? SelectedHome : Home} />
        <BottomNavigationAction icon={dictionary[value] === store? SelectedStore : Store} />
        <BottomNavigationAction  icon={dictionary[value] === profile? SelectedProfile : Profile} />
        <BottomNavigationAction  icon={dictionary[value] === settings? SelectedSettings : Settings} />
      </BottomNavigation>
    </Box>
  );
}
