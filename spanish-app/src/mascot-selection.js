import { Dog, Cat, Bear, Giraffe, Pig, Horse, Bird } from "./mascot"
import { mascotComponents } from "./mascot"
import {
    getOwnedMascots,
    addOwnedMascot,
    getSelectedMascot,
    setSelectedMascot,
    getAvailableMascots,
    removeAvailableMascot,
    setAvailableMascots // if you need to overwrite the list
  } from './utils/mascotStorage.js'; // Adjust path as needed
import { useEffect, useState } from "react";

export function MascotSelector({onSelection}) {

    const [mascotList, setMascotList] = useState(getOwnedMascots());
    const [selectedId, setSelectedId] = useState(getSelectedMascot());

    useEffect(() => {
        setSelectedMascot(selectedId);
    }, [selectedId]);
    
    function handleMascotButtonClick(id) {
        onSelection(id);
        setSelectedId(id); // UI updates immediately

    }

    return (
        <div className="mascot-profile-selection-container">
            {

                mascotList.map(
                    (id) => {
                        
                        return (
                            <button 
                            key={id}
                            className={`mascot-button ${id == selectedId? "selected" : "notselected"}`} 
                            onClick={() => handleMascotButtonClick(id)}
                            >
                                {mascotComponents[id][0]()}
                            </button>
                        )

                    }
                )
            }
        </div>
    )

}