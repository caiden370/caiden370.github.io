import { minHeight } from "@mui/system";
import CustomizableMascot from "./custom-mascot.js";
import React, { useState, useEffect } from 'react';
import "./animations/animations.css"

export const mascotComponents = {
  '0': [Bear, 40],
  '1': [Cat, 70],
  '2': [Dog, 70],
  '3': [Bird, 90],
  '4': [Pig, 350],
  '5': [Horse, 100],
  '6': [Giraffe, 110],
  '7': [Wolf, 120],
  '8': [Penguin, 150],
  '9': [Goat, 120],

  // Bear Options
  '100': [PolarBear, 300],
  '101': [BlackBear, 120],
  '102': [PandaBear, 500],
  '103': [IceBear, 600],
  '104': [PurpleBear, 750],

  // Cat Options
  '200': [SiameseCat, 150],
  '201': [BlackCat, 300],
  '202': [GrayCat, 180],
  '203': [CalicoCat, 450],
  '204': [RainbowCat, 750],
  '205': [MagicalCat, 900],

  // Dog Options
  '300': [Dalmatian, 400],
  '301': [GermanShepherd, 230],
  '302': [Husky, 550],
  '303': [Corgi, 450],
  '304': [OceanDog, 760],
  '305': [EnvironmentalDog, 850],

  // Bird Options
  '400': [Cardinal, 700],
  '401': [BlueJay, 400],
  '402': [Robin, 150],
  '403': [Flamingo, 500],
  '404': [Peacock, 650],
  '405': [FireBird, 850],

  // Pig Options
  '500': [HampshirePig, 150],
  '501': [SpottedPig, 350],
  '502': [MintPig, 1000],
  '503': [MagicalPig, 800],

  // Horse Options
  '600': [WhiteHorse, 150],
  '601': [BlackHorse, 300],
  '602': [PalominoHorse, 400],
  '603': [PintoHorse, 550],
  '604': [GalaxyHorse, 900],

  // Giraffe Options
  '700': [ReticulatedGiraffe, 250],
  '701': [MasaiGiraffe, 450],
  '702': [SunsetGiraffe, 700],

  //Penguin Options
  '800': [BluePenguin, 300],
  '801': [GrayPenguin, 120],
  '802': [PurplePenguin, 400],
  '803': [EmperorPenguin, 550],
  '804': [KingPenguin, 600],
  '805': [MagicalPenguin, 850],

  //Goat Options
  '900': [BrownGoat, 150],
  '901': [GoldenGoat, 400],
  '902': [TheGoat, 750],
  '903': [EnvironmentalGoat, 600],
  '904': [DepreciatedGoat, 950]



};

export function getSortedMascotIdsByPrice() {
  // Convert the mascotComponents object into an array of [id, component, price]
  const mascotsWithPrices = Object.entries(mascotComponents).map(([id, value]) => {
    const price = value[1]; // The price is at index 1 of the array
    return { id, price };
  });
  mascotsWithPrices.sort((a, b) => a.price - b.price);
  return mascotsWithPrices.map(mascot => Number(mascot.id));
}



export default function Mascot({ id = -10}) {
    const [animation, setAnimation] = useState('');
    
    // 1. Determine which mascot to show
    let mascotId = id;
    if (id === -10) {
        mascotId = Number(localStorage.getItem('selectedMascot') || 0);
    }
    
    const SelectedMascot = mascotComponents[mascotId]?.[0] || mascotComponents[0][0];

    // 2. Logic to trigger a random animation every 5 seconds
    useEffect(() => {
        const animations = [
          'spin', 'pulse', 'nudge', 'boing', 'confused', 
          'bow', 'wobble', 'pop', 'jelly', 'flip', 
          'float', 'shiver', 'victory'
        ];
        
        const interval = setInterval(() => {
            // Pick a random animation
            const randomAnim = animations[Math.floor(Math.random() * animations.length)];
            
            setAnimation(randomAnim);

            // Remove the class after the animation finishes (0.8s) so it can be re-triggered
            setTimeout(() => setAnimation(''), 800);
            
        }, 2000); // Happens every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="mascot-container" 
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div 
                className={animation ? 'animate-mascot' : ''} 
                style={{ animationName: animation }}
            >
                <SelectedMascot />
            </div>
        </div>
    );
}



// ************************** OPTIONS ******************************* //

// ============= BEARS =============

// Classic Brown Bear
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

// Polar Bear
export function PolarBear(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bear"
      bodyColor="#FFFAFA"
      earColor="#E6E6FA"
      noseColor="#000000"
      accentColor="#87CEEB"
      clickable={clickable}
    />
  );
}

// Black Bear
export function BlackBear(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bear"
      bodyColor="#2F2F2F"
      earColor="#1C1C1C"
      noseColor="#000000"
      accentColor="#696969"
      clickable={clickable}
    />
  );
}

// Panda Bear
export function PandaBear(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bear"
      bodyColor="#FFFFFF"
      earColor="#000000"
      noseColor="#000000"
      accentColor="#000000"
      clickable={clickable}
    />
  );
}

// Panda Bear
export function PurpleBear(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bear"
      bodyColor="rgb(222, 138, 255)"
      earColor="rgb(87, 212, 253)"
      noseColor="rgb(70, 2, 102)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}




// ============= CATS =============

// Orange Tabby Cat
export function Cat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#FFA07A"
      earColor="#FF6347"
      noseColor="#FFB6C1"
      accentColor="#FF69B4"
      clickable={clickable}
    />
  );
}

// Siamese Cat
export function SiameseCat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#F5F5DC"
      earColor="#8B4513"
      noseColor="#FFB6C1"
      accentColor="#4169E1"
      clickable={clickable}
    />
  );
}

// Black Cat
export function BlackCat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#292828"
      earColor="#1C1C1C"
      noseColor="#FFB6C1"
      accentColor="#32CD32"
      clickable={clickable}
    />
  );
}

// Gray Cat
export function GrayCat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#C0C0C0"
      earColor="#696969"
      noseColor="#FFB6C1"
      accentColor="#4169E1"
      clickable={clickable}
    />
  );
}

// Calico Cat
export function CalicoCat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#FFEFD5"
      earColor="#FF6347"
      noseColor="#FFB6C1"
      accentColor="#8B4513"
      clickable={clickable}
    />
  );
}

export function MagicalCat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="rgb(248, 129, 38)"
      earColor="rgb(144, 61, 185)"
      noseColor="rgb(239, 100, 14)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}

// ============= DOGS =============

// Golden Retriever
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

// Dalmatian
export function Dalmatian(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#FFFFFF"
      earColor="#000000"
      noseColor="#000000"
      accentColor="#FF0000"
      clickable={clickable}
    />
  );
}

// German Shepherd
export function GermanShepherd(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#8B4513"
      earColor="#2F2F2F"
      noseColor="#000000"
      accentColor="#DAA520"
      clickable={clickable}
    />
  );
}

// Husky
export function Husky(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#C0C0C0"
      earColor="#2F2F2F"
      noseColor="#000000"
      accentColor="#4169E1"
      clickable={clickable}
    />
  );
}

// Wolf
export function Wolf(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#DCDCDC"
      earColor="#476696"
      noseColor="#476696"
      accentColor="#476696"
      clickable={clickable}
    />
  );
}

// Corgi
export function Corgi(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#DEB887"
      earColor="#8B4513"
      noseColor="#000000"
      accentColor="#FF6347"
      clickable={clickable}
    />
  );
}

export function EnvironmentalDog(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="rgb(6, 67, 32)"
      earColor="rgb(243, 216, 84)"
      noseColor="rgb(247, 155, 209)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}

// ============= BIRDS =============

// Canary
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

// Cardinal
export function Cardinal(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#DC143C"
      earColor="transparent"
      noseColor="#FF4500"
      accentColor="#8B0000"
      clickable={clickable}
    />
  );
}

// Blue Jay
export function BlueJay(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#4169E1"
      earColor="transparent"
      noseColor="#000000"
      accentColor="#FFFFFF"
      clickable={clickable}
    />
  );
}

// Robin
export function Robin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#8B4513"
      earColor="transparent"
      noseColor="#FF4500"
      accentColor="#FF6347"
      clickable={clickable}
    />
  );
}

// Flamingo
export function Flamingo(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#FFB6C1"
      earColor="transparent"
      noseColor="#FF1493"
      accentColor="#FF69B4"
      clickable={clickable}
    />
  );
}

// Peacock
export function Peacock(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#008B8B"
      earColor="transparent"
      noseColor="#DAA520"
      accentColor="#32CD32"
      clickable={clickable}
    />
  );
}

// ============= PIGS =============

// Pink Pig
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

// Hampshire Pig (Black with white belt)
export function HampshirePig(clickable=false) {
  return (
    <CustomizableMascot
      animalType="pig"
      bodyColor="#2F2F2F"
      earColor="#000000"
      noseColor="#FFB6C1"
      accentColor="#FFFFFF"
      clickable={clickable}
    />
  );
}

// Spotted Pig
export function SpottedPig(clickable=false) {
  return (
    <CustomizableMascot
      animalType="pig"
      bodyColor="#FFEFD5"
      earColor="#8B4513"
      noseColor="#FFB6C1"
      accentColor="#2F2F2F"
      clickable={clickable}
    />
  );
}

export function MagicalPig(clickable=false) {
  return (
    <CustomizableMascot
      animalType="pig"
      bodyColor="rgb(234, 114, 158)"
      earColor="rgb(153, 10, 62)"
      noseColor="rgb(41, 2, 2)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

// ============= HORSES =============

// Bay Horse
export function Horse(clickable=false) {
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

// White Horse
export function WhiteHorse(clickable=false) {
  return (
    <CustomizableMascot
      animalType="horse"
      bodyColor="#FFFFFF"
      earColor="#E6E6FA"
      noseColor="#FFB6C1"
      accentColor="#C0C0C0"
      clickable={clickable}
    />
  );
}

// Black Horse
export function BlackHorse(clickable=false) {
  return (
    <CustomizableMascot
      animalType="horse"
      bodyColor="#2F2F2F"
      earColor="#000000"
      noseColor="#000000"
      accentColor="#696969"
      clickable={clickable}
    />
  );
}

// Palomino Horse
export function PalominoHorse(clickable=false) {
  return (
    <CustomizableMascot
      animalType="horse"
      bodyColor="#DAA520"
      earColor="#B8860B"
      noseColor="#000000"
      accentColor="#FFFACD"
      clickable={clickable}
    />
  );
}

// Pinto Horse
export function PintoHorse(clickable=false) {
  return (
    <CustomizableMascot
      animalType="horse"
      bodyColor="#FFEFD5"
      earColor="#8B4513"
      noseColor="#000000"
      accentColor="#2F2F2F"
      clickable={clickable}
    />
  );
}

// ============= GIRAFFES =============

// Classic Giraffe
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

// Reticulated Giraffe
export function ReticulatedGiraffe(clickable=false) {
  return (
    <CustomizableMascot
      animalType="giraffe"
      bodyColor="#F4A460"
      earColor="#8B4513"
      noseColor="#2F2F2F"
      accentColor="#8B0000"
      clickable={clickable}
    />
  );
}

// Masai Giraffe
export function MasaiGiraffe(clickable=false) {
  return (
    <CustomizableMascot
      animalType="giraffe"
      bodyColor="#DEB887"
      earColor="#A0522D"
      noseColor="#2F2F2F"
      accentColor="#800000"
      clickable={clickable}
    />
  );
}

// ============= FANTASY/CREATIVE VARIATIONS =============

// Rainbow Cat
export function RainbowCat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="cat"
      bodyColor="#FF69B4"
      earColor="#32CD32"
      noseColor="#FFD700"
      accentColor="#9370DB"
      clickable={clickable}
    />
  );
}

// Ice Bear
export function IceBear(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bear"
      bodyColor="#B0E0E6"
      earColor="#87CEEB"
      noseColor="#4169E1"
      accentColor="#00BFFF"
      clickable={clickable}
    />
  );
}

// Fire Bird
export function FireBird(clickable=false) {
  return (
    <CustomizableMascot
      animalType="bird"
      bodyColor="#FF4500"
      earColor="transparent"
      noseColor="#FFD700"
      accentColor="#DC143C"
      clickable={clickable}
    />
  );
}

// Galaxy Horse
export function GalaxyHorse(clickable=false) {
  return (
    <CustomizableMascot
      animalType="horse"
      bodyColor="#483D8B"
      earColor="#2F2F2F"
      noseColor="#FFD700"
      accentColor="#DA70D6"
      clickable={clickable}
    />
  );
}

// Mint Pig
export function MintPig(clickable=false) {
  return (
    <CustomizableMascot
      animalType="pig"
      bodyColor="#98FB98"
      earColor="#32CD32"
      noseColor="#FF69B4"
      accentColor="#00FF7F"
      clickable={clickable}
    />
  );
}

// Sunset Giraffe
export function SunsetGiraffe(clickable=false) {
  return (
    <CustomizableMascot
      animalType="giraffe"
      bodyColor="#FF6347"
      earColor="#FF4500"
      noseColor="#8B0000"
      accentColor="#FFD700"
      clickable={clickable}
    />
  );
}

// Ocean Dog
export function OceanDog(clickable=false) {
  return (
    <CustomizableMascot
      animalType="dog"
      bodyColor="#20B2AA"
      earColor="#008B8B"
      noseColor="#000080"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

// **************Penguins*************** //

export function Penguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(0, 0, 0)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(255, 213, 63)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

export function BluePenguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(18, 0, 120)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(255, 213, 63)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

export function GrayPenguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(43, 41, 54)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(255, 213, 63)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

export function PurplePenguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(25, 17, 69)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(255, 213, 63)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

export function EmperorPenguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(56, 2, 70)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(150, 18, 18)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

export function KingPenguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(18, 65, 6)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(181, 24, 160)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

export function MagicalPenguin(clickable=false) {
  return (
    <CustomizableMascot
      animalType="penguin"
      bodyColor="rgb(226, 129, 250)"
      earColor="rgb(126, 120, 120)"
      noseColor="rgb(255, 0, 0)"
      accentColor="#00CED1"
      clickable={clickable}
    />
  );
}

// GOATS //

export function Goat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="goat"
      bodyColor="rgb(215, 221, 236)"
      earColor="rgb(97, 95, 51)"
      noseColor="rgb(228, 151, 196)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}

export function BrownGoat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="goat"
      bodyColor="rgb(170, 133, 127)"
      earColor="rgb(72, 71, 66)"
      noseColor="rgb(228, 151, 196)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}


export function GoldenGoat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="goat"
      bodyColor="rgb(238, 204, 48)"
      earColor="rgb(255, 140, 0)"
      noseColor="rgb(236, 176, 34)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}


export function TheGoat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="goat"
      bodyColor="rgb(125, 140, 230)"
      earColor="rgb(255, 149, 0)"
      noseColor="rgb(23, 207, 253)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}

export function EnvironmentalGoat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="goat"
      bodyColor="rgb(120, 249, 150)"
      earColor="rgb(144, 61, 185)"
      noseColor="rgb(239, 187, 14)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}

export function DepreciatedGoat(clickable=false) {
  return (
    <CustomizableMascot
      animalType="goat"
      bodyColor="rgb(11, 44, 94)"
      earColor="rgb(0, 252, 252)"
      noseColor="rgb(0, 252, 252)"
      accentColor="rgb(100, 100, 100)"
      clickable={clickable}
    />
  );
}





