import { Typography } from "@mui/material";
import { safeGetItem } from "./App"
import Mascot, { getSortedMascotIdsByPrice } from "./mascot";
import { SvgIcon } from '@mui/material';
import { ReactComponent as CoinsSvg } from './svgs/coins.svg';  
import { getAvailableMascots, addOwnedMascot, getOwnedMascots } from "./utils/mascotStorage";
import { useState } from "react";
import {Button} from "@mui/material";
import { mascotComponents } from "./mascot"






export default function Store({setGlobalCoins}) {

    const [localCoins, setLocalCoins] = useState(safeGetItem('coins'));
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [openRequestModal, setOpenRequestModal] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState(false);
    const [curPrice, setCurPrice] = useState(100);
    const [curId, setCurId] = useState(0);
    const [mascotList, setMascotList] = useState(getStoreMascots());

    function getStoreMascots() {
        const owned = new Set(getOwnedMascots());
        const ids = getSortedMascotIdsByPrice();
        const avail = Array(ids.length);
        for (let i = 0; i < ids.length; i++) {
            if (!owned.has(ids[i])) {
                avail[i] = ids[i];
            }
        }
        return avail; 
    }

    function updateStoredCoins(amount) {
        const storedCoins = safeGetItem('coins');
        if (storedCoins - amount < 0) {
            return false;
        } else {
            localStorage.setItem('coins', storedCoins - amount);
            setGlobalCoins(safeGetItem('coins'));
            return true;
        }
    }


    function handleStoreClick(price, id) {
        setCurId(id);
        setCurPrice(price);
        setOpenRequestModal(true);
    }


      
      
    

    function StoreItem(id, price) {
        return (
            <div className='store-mascot-button' onClick={() => handleStoreClick(price, id)}>
                {mascotComponents[id][0]()}
                <div className="store-mascot-price">
                    <Typography align="center">{price}</Typography>
                </div>
            </div>
        )


    }

    function StatusModal() {
        const statusClass = purchaseResult ? "correct" : "incorrect";
    
        return (
        <div className="mr-text-response-modal-container">
            <div
            key="mr-text-response-modal"
            className={`mr-text-response-modal ${statusClass}`}
            >
            <Typography sx={{fontWeight:'bold'}}>{purchaseResult ? "Purchase Successful" : "Purchase Failure"}</Typography>
            <Typography></Typography>
            </div>
            </div>
        );
    }

    function handlePurchase() {
        const result = updateStoredCoins(curPrice);
        if (result) {
            addOwnedMascot(curId);
            setMascotList(getStoreMascots());
        }
        setPurchaseResult(result);
        setOpenStatusModal(true);
        setTimeout(() => {
          setOpenStatusModal(false);
        }, 5000);
        setOpenRequestModal(false);
    }

    function requestButton() {
        const price = curPrice;
        const id = curId;
        const disabled = safeGetItem('coins') - price < 0;
        return (
            <div className='mixed-review-continue'>
                <Button disabled={disabled} className='app-button primary' variant='contained' onClick={() => handlePurchase(price, id)}>
                    <Typography>Purchase</Typography>
                </Button>
            </div>
        );
    }


    function closeButton() {
        return (
            <div className='mixed-review-continue'>
                <Button className='app-button failed' variant='contained' onClick={() => setOpenRequestModal(false)}>
                    <Typography>Close</Typography>
                </Button>
            </div>
        );
    }

    


    function RequestModal() {
        return (
            <>
            <div className='store-request-modal-overlay'></div>
            <div className='store-request-modal-container'>
                <div className='store-request-modal-card'>

                
                <div className='store-request-mascot'>
                    {mascotComponents[curId][0]()}
                </div>
                <div className="store-request-coin-container">            
                    <div className="coin-icon-container"><SvgIcon ><CoinsSvg sx={{color:'#ffd500'}}/></SvgIcon></div>
                    <Typography level='h3' sx={{color:'black', fontWeight:'bold'}}>{curPrice}</Typography>
                </div>
                {requestButton()}
                {closeButton()}
                </div>

            </div>
            </>
        );
    }


    return (
        <div className='store-container'>
            <div className='store-header'>
                <Mascot clickable={true}/>
                <Typography align="center" sx={{fontSize: 25}}>Store</Typography>
            </div>
            <div className='store-selection'>
            {
                mascotList.length > 0? (mascotList.map(
                    (id) => {
                        return (
                            <>
                                {StoreItem(id, mascotComponents[id][1])}
                            </>
                        )
                    }
                )) : ("There are no items in the store")
            }

            </div>


            {openRequestModal && RequestModal()}
            {openStatusModal && StatusModal()}

        </div>
    )
    

}




