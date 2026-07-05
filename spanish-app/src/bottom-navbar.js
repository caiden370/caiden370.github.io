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
  House,
  Brain,
  Gear,
  MapTrifold
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
  const topWords = 'TopWords';
  const elCamino = 'ElCamino';
  const store = 'Store';
  const profile = 'Profile';  
  const settings = 'Settings';


  const iconClass = "drop-shadow-sm bottom-nav-icon";
  const selectedIconClass = "drop-shadow-sm bottom-nav-icon bottom-nav-icon-selected";

  const Home = <House color={"rgb(0, 174, 255)"} weight={"duotone"} className={iconClass} ></House>
  const TopWords = <Brain color={"rgb(4, 114, 2)"} weight={"duotone"} className={iconClass} ></Brain>
  const ElCamino = <MapTrifold color={"rgb(180, 103, 28)"} weight={"duotone"} className={iconClass} ></MapTrifold>
  const Store = <Storefront color={"rgb(255, 0, 0)"} weight={"duotone"} className={iconClass} ></Storefront>
  const Profile = <UserCircle color={"rgb(226, 123, 13)"} weight={"duotone"} className={iconClass} ></UserCircle>
  

  const SelectedHome = <House color={"rgb(0, 174, 255)"} weight={"duotone"} className={selectedIconClass} ></House>
  const SelectedTopWords = <Brain color={"rgb(4, 114, 2)"} weight={"duotone"} className={selectedIconClass} ></Brain>
  const SelectedElCamino = <MapTrifold color={"rgb(180, 103, 28)"} weight={"duotone"} className={selectedIconClass} ></MapTrifold>
  const SelectedStore = <Storefront color={"rgb(255, 0, 0)"} weight={"duotone"} className={selectedIconClass} ></Storefront>
  const SelectedProfile = <UserCircle color={"rgb(226, 123, 13)"} weight={"duotone"} className={selectedIconClass} ></UserCircle>
  const SelectedSettings =<Gear size={42} color={"rgb(117, 100, 100)"} weight={"duotone"} className={"drop-shadow-sm"} ></Gear>


  const dictionary = {
    "0": chapters,
    "1": topWords,
    "2": elCamino,
    "3": store,
    "4": profile,
    "5": settings,
};
  return (
    <Box className="bottom-nav-box" sx={{ width: "100vw"}}>
      <BottomNavigation
        sx={{paddingBottom: 'clamp(8px, 2.8vw, 20px)', backgroundColor:'inherit'}}
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
        <BottomNavigationAction icon={dictionary[value] === topWords? SelectedTopWords : TopWords} />
        <BottomNavigationAction icon={dictionary[value] === elCamino? SelectedElCamino : ElCamino} />
        <BottomNavigationAction icon={dictionary[value] === store? SelectedStore : Store} />
        <BottomNavigationAction  icon={dictionary[value] === profile? SelectedProfile : Profile} />
        {/* <BottomNavigationAction  icon={dictionary[value] === settings? SelectedSettings : Settings} /> */}
      </BottomNavigation>
    </Box>
  );
}
