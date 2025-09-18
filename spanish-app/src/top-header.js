import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { SvgIcon } from '@mui/material';
import { ReactComponent as CoinsSvg } from './svgs/coins.svg';  // adjust path as needed
import './App.css';
import { currencyIcon } from "./topic-icons";

import { getLevelColor } from "./profile-page";
import { Height } from "@mui/icons-material";

export default function TopHeader({coins, level}) {
    const CoinIcon = currencyIcon();
    return (
        <div className="top-header-container">
            <div className="header-level-container" sx={{backgroundColor: getLevelColor(level), Height:'30px', Width:'30px', fontFamily: '"Inter", sans-serif'}}>{level}</div>
            <div className="coin-container">            
                <div className="coin-icon-container">{CoinIcon}</div>
                <div className='coin-amount-container'><Typography level='h3' sx={{color:"rgb(28, 72, 4)", fontWeight:'bold', fontFamily: '"Inter", sans-serif'}}>{coins}</Typography></div>
            </div>

        </div>
    );

}