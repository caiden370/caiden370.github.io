import { 
    HandWaving,
    ShoppingCart,
    Book,
    Users,
    PawPrint,
    House,
    Chats,
    Hamburger,
    Cloud,
    Clock,
    Heart,
    Airplane,
    FirstAid,
    Money,
    SmileyWink,
    Star,
    ThumbsUp,
    Student,
    Baby
  } from 'phosphor-react';
  
  // Configuration object - change size here to affect all icons
  const ICON_CONFIG = {
    size: 40,  // Change this number to resize all icons at once
    weight: "duotone", // Can be: thin, light, regular, bold, fill, duotone
    className: "drop-shadow-sm"
  };
  
  // Alternative: you can also create different size presets
  export const ICON_SIZES = {
    small: 16,
    medium: 24,
    large: 32,
    extraLarge: 48
  };
  
  // Styled icons with centralized sizing
  export const StyledTopicIcons = {
    "GreetingsIcon": (props) => (
      <HandWaving 
        size={ICON_CONFIG.size} 
        color="#FF6B6B" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "EverydayEssentialsIcon": (props) => (
      <ShoppingCart 
        size={ICON_CONFIG.size} 
        color="#4ECDC4" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "ConjugatingVerbsIcon": (props) => (
      <Book 
        size={ICON_CONFIG.size} 
        color="#9B59B6" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "PeopleFamilyIcon": (props) => (
      <Users 
        size={ICON_CONFIG.size} 
        color="#E67E22" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "ActivitiesIcon": (props) => (
      <PawPrint 
        size={ICON_CONFIG.size} 
        color="#FF8C00" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "AroundTheHouseIcon": (props) => (
      <House 
        size={ICON_CONFIG.size} 
        color="#27AE60" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "DescribingThingsIcon": (props) => (
      <Chats 
        size={ICON_CONFIG.size} 
        color="#F39C12" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "FoodDrinkIcon": (props) => (
      <Hamburger 
        size={ICON_CONFIG.size} 
        color="#E74C3C" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "WeatherIcon": (props) => (
      <Cloud 
        size={ICON_CONFIG.size} 
        color="#85C1E9" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "VerbTensesIcon": (props) => (
      <Clock 
        size={ICON_CONFIG.size} 
        color="#8E44AD" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "HobbiesIcon": (props) => (
      <Heart 
        size={ICON_CONFIG.size} 
        color="#E91E63" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "TravelIcon": (props) => (
      <Airplane 
        size={ICON_CONFIG.size} 
        color="#2196F3" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "HealthBodyIcon": (props) => (
      <FirstAid 
        size={ICON_CONFIG.size} 
        color="#F44336" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "ShoppingMoneyIcon": (props) => (
      <Money 
        size={ICON_CONFIG.size} 
        color="#4CAF50" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "WeTheyIcon": (props) => (
      <Users 
        size={ICON_CONFIG.size} 
        color="#E67E22" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "IntroductionsIcon": (props) => (
      <HandWaving 
        size={ICON_CONFIG.size} 
        color="#FF6B6B" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "FeelingsEmotionsIcon": (props) => (
      <SmileyWink 
        size={ICON_CONFIG.size} 
        color="#FFC107" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "GivingOpinionsIcon": (props) => (
      <ThumbsUp 
        size={ICON_CONFIG.size} 
        color="#00BCD4" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "ComplimentsIcon": (props) => (
      <Star 
        size={ICON_CONFIG.size} 
        color="#FFD700" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "ConversationsIcon": (props) => (
      <Chats 
        size={ICON_CONFIG.size} 
        color="#F39C12" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "MedicineIcon": (props) => (
      <FirstAid 
        size={ICON_CONFIG.size} 
        color="#F44336" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "PregnancyIcon": (props) => (
      <Baby 
        size={ICON_CONFIG.size} 
        color="#FF69B4" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "TenseIcon": (props) => (
      <Clock 
        size={ICON_CONFIG.size} 
        color="#8E44AD" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    ),
    "SchoolIcon": (props) => (
      <Student 
        size={ICON_CONFIG.size} 
        color="#607D8B" 
        weight={ICON_CONFIG.weight}
        className={ICON_CONFIG.className}
        {...props} 
      />
    )
  };
  
  // Alternative: Function to create icons with custom size override
  export const createIconWithSize = (iconName, customSize) => {
    const IconComponent = StyledTopicIcons[iconName];
    if (!IconComponent) return null;
    
    return (props) => IconComponent({ ...props, size: customSize });
  };
  
  // Usage examples:
  // 1. To change all icon sizes: modify ICON_CONFIG.size above
  // 2. To use different preset sizes: 
  //    const LargeGreetingIcon = createIconWithSize("GreetingsIcon", ICON_SIZES.large);
  // 3. Normal usage: <StyledTopicIcons.GreetingsIcon />

  export function currencyIcon() {
    return <Money 
    size={30} 
    color="rgb(7, 86, 49)" 
    weight={ICON_CONFIG.weight}
    className={ICON_CONFIG.className}
  />

};