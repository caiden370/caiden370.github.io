import React from 'react';
import { Flame, Shield, Heart, Zap, RefreshCw, Skull, Sword, Target, SkipForward } from 'lucide-react';
import { Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt'; 

export default function GenericCard({
  ability,
  isActive = false,
  isDisabled = false,
  onClick,
  showCost = true,
  showEffect = true,
  size = 'small', // 'small', 'normal', 'large'
  variant = 'default', // 'default', 'minimal', 'detailed'
  className = '',
  style = {}
}) {
  
  const getAbilityIcon = (name) => {
    const iconMap = {
      fire: Flame,
      shield: Shield,
      heal: Heart,
      zap: Zap,
      restore: RefreshCw,
      poison: Skull,
      strike: Sword,
      stab: Target,
      skip: SkipForward
    };
    return iconMap[name] || SkipForward;
  };

  const getAbilityColor = (name) => {
    const colorMap = {
      fire: { backgroundImage: 'linear-gradient(to right, #ef4444, #f97316)' },
      shield: { backgroundImage: 'linear-gradient(to right, #3b82f6, #06b6d4)' },
      heal: { backgroundImage: 'linear-gradient(to right, #22c55e, #10b981)' },
      zap: { backgroundImage: 'linear-gradient(to right, #facc15, #f59e0b)' },
      restore: { backgroundImage: 'linear-gradient(to right, #a855f7, #8b5cf6)' },
      poison: { backgroundImage: 'linear-gradient(to right, #5b21b6, #166534)' },
      strike: { backgroundImage: 'linear-gradient(to right, #6b7280, #475569)' },
      stab: { backgroundImage: 'linear-gradient(to right, #dc2626, #991b1b)' }
    };
  
    // Return the style object from the map, or a default gray gradient.
    return colorMap[name] || { backgroundImage: 'linear-gradient(to right, #6b7280, #4b5563)' };
  };

  const getAbilityColorClass = (name) => {
    const colorMap = {
      fire: 'bg-gradient-to-br from-red-500 to-orange-500',
      shield: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      heal: 'bg-gradient-to-br from-green-500 to-emerald-500',
      zap: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      restore: 'bg-gradient-to-br from-purple-500 to-violet-500',
      poison: 'bg-gradient-to-br from-purple-800 to-green-800',
      strike: 'bg-gradient-to-br from-gray-500 to-slate-600',
      stab: 'bg-gradient-to-br from-red-600 to-red-800'
    };
    return colorMap[name] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };


  const getMoveText = (move) => {
    if (move.damage) return `${move.damage} damage`;
    if (move.heal) return `${move.heal} heal`;
    if (move.block) return `${move.block} block`;
    return '';
  };

  const Icon = getAbilityIcon(ability.name);
  const moveText =  getMoveText(ability.move);

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(ability);
    }
  };

  return (
    <div className={`sg-spell-card`} onClick={handleClick} style={isDisabled? {} : getAbilityColor(ability.name)}>
        <Icon/>
        <Typography align='center'>{moveText}</Typography>
        <div className='sg-energy'><BoltIcon sx={{color:"rgb(123, 0, 253)"}}/><Typography align='center' sx={{color: 'white'}}>{ability.cost}</Typography></div>
    </div>


  );
}



export function AbilityAnimation({ability}) {
    
    const getAbilityIcon = (name) => {
        const iconMap = {
          fire: Flame,
          shield: Shield,
          heal: Heart,
          zap: Zap,
          restore: RefreshCw,
          poison: Skull,
          strike: Sword,
          stab: Target,
          skip: SkipForward
        };
        return iconMap[name] || SkipForward;
      };
    
      const getAbilityColor = (name) => {
        const colorMap = {
          fire: { backgroundImage: 'linear-gradient(to right, #ef4444, #f97316)' },
          shield: { backgroundImage: 'linear-gradient(to right, #3b82f6, #06b6d4)' },
          heal: { backgroundImage: 'linear-gradient(to right, #22c55e, #10b981)' },
          zap: { backgroundImage: 'linear-gradient(to right, #facc15, #f59e0b)' },
          restore: { backgroundImage: 'linear-gradient(to right, #a855f7, #8b5cf6)' },
          poison: { backgroundImage: 'linear-gradient(to right, #5b21b6, #166534)' },
          strike: { backgroundImage: 'linear-gradient(to right, #6b7280, #475569)' },
          stab: { backgroundImage: 'linear-gradient(to right, #dc2626, #991b1b)' }
        };
      
        // Return the style object from the map, or a default gray gradient.
        return colorMap[name] || { backgroundImage: 'linear-gradient(to right, #6b7280, #4b5563)' };
      };

    const Icon = getAbilityIcon(ability.name);

    const getMoveText = (move) => {
        if (move.damage) return `${move.damage} damage`;
        if (move.heal) return `${move.heal} heal`;
        if (move.block) return `${move.block} block`;
        if (move.skip) return 'skip';
        return '';
      };

    const cardColor = getAbilityColor(ability.name);
    


    return (
        <div className='sg-ability-container' style={cardColor}>
        
        <div className={`sg-ability`}>
        <Icon/>
        {/* <Typography align='center'>{ability.name}</Typography> */}
        </div>

        <div className={`sg-ability`}>
        <Typography align='center'>{getMoveText(ability.move)}</Typography>
        </div>
        </div>
    )

}