import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { SvgIcon } from '@mui/material';
import { ReactComponent as CoinsSvg } from './svgs/coins.svg';  // adjust path as needed
import './App.css';

import { getLevelColor } from "./profile-page";
import { Height } from "@mui/icons-material";

export default function TopHeader({coins, level}) {
    return (
        <div className="top-header-container">
            <div className="header-level-container" sx={{backgroundColor: getLevelColor(level), Height:'30px', Width:'30px'}}>{level}</div>
            <div className="coin-container">            
                <div className="coin-icon-container"><SvgIcon ><CoinsSvg sx={{color:'#ffd500'}}/></SvgIcon></div>
                <div className='coin-amount-container'><Typography level='h3' sx={{color:'black', fontWeight:'bold'}}>{coins}</Typography></div>
            </div>

        </div>
    );

}