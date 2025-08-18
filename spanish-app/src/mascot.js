import { minHeight } from "@mui/system";
import CustomizableMascot from "./custom-mascot.js";

export const mascotComponents = {
    '-1': Giraffe,
    '0': Bear,
    '1': Cat,
    '2': Dog,
    '3': Bird,
    '4': Pig,
    '5': Horse,
    '6': Giraffe,

};

export default function Mascot({id = -10}) {
    // Get the corresponding component from our mapping
    let mascotId = id
    if (id == -10) {
        mascotId = Number(localStorage.getItem('selectedMascot') || -1);
    }
    
    const SelectedMascot = mascotComponents[mascotId];

    if (!SelectedMascot) {
        // Handle cases where an invalid mascotName is provided
        console.warn(`Mascot "${mascotId}" not found. Please check the mascotComponents mapping and ensure the component file exists.`);
        return (
            <MascotDepreciated/>
        );
    }

    return (
        <div className="mascot-container">
            <SelectedMascot/>
        </div>
    );
}



// ************************** OPTIONS ******************************* //

// Bear Component
export function Bear(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bear"
      bodyColor="#D2691E"
      earColor="#8B4513"
      noseColor="#000000"
      accentColor="#FF69B4"
      clickable={clickable}
    />
  );
}

// Cat Component
export function Cat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#FFA07A"
      earColor="#FF6347"
      noseColor="#000000"
      accentColor="#FF69B4"
      clickable={clickable}
    />
  );
}

// Dog Component
export function Dog(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#F4A460"
      earColor="#8B4513"
      noseColor="#000000"
      accentColor="#FF69B4"
      clickable={clickable}
      
    />
  );
}

// Bird Component
export function Bird(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#FFD700"
      earColor="transparent"
      noseColor="#FF4500"
      accentColor="#1E90FF"
      clickable={clickable}
    />
  );
}

// Pig Component
export function Pig(clickable=false) {
  return (
    <CustomizableMascot
      animalType="pig"
      bodyColor="#FFC0CB"
      earColor="#FF69B4"
      noseColor="#FF69B4"
      accentColor="#FF1493"
      clickable={clickable}
    />
  );
}

// Horse Component
export function Horse(clickable) {
  return (
    <CustomizableMascot
      animalType="horse"
      bodyColor="#A0522D"
      earColor="#8B4513"
      noseColor="#000000"
      accentColor="#FFD700"
      clickable={clickable}
    />
  );
}

// Giraffe Component
export function Giraffe(clickable=false) {
  return (
    <CustomizableMascot
      animalType="giraffe"
      bodyColor="#FFE4B5"
      earColor="#D2B48C"
      noseColor="#8B4513"
      accentColor="#FFD700"
      clickable={clickable}
    />
  );
}










// ****************** DEPRECIATED ******************************
export function MascotDepreciated({color, smiling, speaking, noseSize = 'medium', small = true}) {

    let lipModifier = 'smiling';
    if (smiling) {
        lipModifier = 'smiling';
    } else if (speaking) {
        lipModifier = 'speaking';
    }

    let containerStyle = {};
    if (small) {
        containerStyle = {
            height: '80px',
            width: '60px',
            minHeight: '80px',
            minWidth: '60px'
        };
    }

    return (
        <div className="mascot-container" sx={{containerStyle}}>
            <div className='mascot-ear-container'>
                <div className='mascot-ear left'></div>
                <div className='mascot-ear right'></div>
            </div>
            <div className="mascot-body" sx={{backgroundColor: {color}}}>

                <div className='mascot-eyes'>
                    <div className="mascot-eye left"></div>
                    <div className="mascot-eye right"></div>
                </div>

                <div className={`mascot-nose ${noseSize}`}>
                    <div className="mascot-nose-bridge"></div>
                    <div className="mascot-nose-tip"></div>
                    <div className="mascot-nostrils">
                        <div className="mascot-nostril left"></div>
                        <div className="mascot-nostril right"></div>
                    </div>
                </div>

                <div className="mascot-mouth-container">
                    {/* <div className="mascot-mouth"></div> */}
                    <div className={`mascot-mouth ${lipModifier}`}></div>
                </div>
            </div>
        </div>
    )
    
}

