import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import './App.css';

export default function TopHeader({coins}) {
    return (
        <div className="top-header-container">
            <div className="coin-icon-container"><LocalAtmIcon sx={{color:'#2ed573'}}/></div>
            <div className='coin-amount-container'><Typography level='h3' sx={{color:'white'}}>{coins}</Typography></div>
        </div>
    );

}