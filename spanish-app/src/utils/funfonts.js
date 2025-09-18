import React from 'react';
import { Typography, Box } from '@mui/material';

// Option 1: Gradient text with shadow
export const GradientTypography = ({ children }) => (
  <Typography 
    variant="h4" 
    align="center" 
    sx={{
      background: 'linear-gradient(45deg, #07b935, #4CAF50, #8BC34A)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      width: "100%", 
      fontWeight: 700, 
      fontFamily: '"Inter", sans-serif',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
      letterSpacing: '0.02em',
      fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' }
    }}
  >
    {children}
  </Typography>
);

// Option 2: Outlined text with glow effect
export const OutlinedGlowTypography = ({ children }) => (
  <Typography 
    variant="h4" 
    align="center" 
    sx={{
      color: '#07b935',
      width: "100%", 
      fontWeight: 800, 
      fontFamily: '"Inter", sans-serif',
      textShadow: `
        0 0 10px rgba(7, 185, 53, 0.5),
        0 0 20px rgba(7, 185, 53, 0.3),
        0 0 30px rgba(7, 185, 53, 0.2)
      `,
      WebkitTextStroke: '1px rgba(7, 185, 53, 0.8)',
      letterSpacing: '0.05em',
      fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' },
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
    }}
  >
    {children}
  </Typography>
);

// Option 3: Solid with enhanced shadow and spacing
export const EnhancedSolidTypography = ({ children }) => (
  <Typography 
    variant="h4" 
    align="center" 
    sx={{
      color: '#07b935',
      width: "100%", 
      fontWeight: 700, 
      fontFamily: '"Poppins", "Inter", sans-serif',
      textShadow: '3px 3px 6px rgba(0,0,0,0.15)',
      letterSpacing: '0.03em',
      fontSize: { xs: '2rem', sm: '2.25rem', md: '2.75rem' },
      lineHeight: 1.2,
      transform: 'translateY(-2px)',
      transition: 'all 0.3s ease-in-out'
    }}
  >
    {children}
  </Typography>
);

// Option 4: With decorative background
export const BackgroundTypography = ({ children }) => (
  <Box sx={{ 
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    py: 2
  }}>
    <Box sx={{
      position: 'absolute',
      background: 'linear-gradient(135deg, rgba(7, 185, 53, 0.1), rgba(76, 175, 80, 0.1))',
      borderRadius: '20px',
      width: '90%',
      height: '100%',
      border: '2px solid rgba(7, 185, 53, 0.2)'
    }} />
    <Typography 
      variant="h4" 
      align="center" 
      sx={{
        color: '#07b935',
        fontWeight: 700, 
        fontFamily: '"Inter", sans-serif',
        letterSpacing: '0.02em',
        fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' },
        zIndex: 1,
        position: 'relative'
      }}
    >
      {children}
    </Typography>
  </Box>
);

// Option 5: Animated bounce effect
export const AnimatedTypography = ({ children }) => (
  <Typography 
    variant="h4" 
    align="center" 
    sx={{
      color: 'rgb(16, 149, 31)',
      width: "100%", 
      fontWeight: 700, 
      fontFamily: '"Inter", sans-serif',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
      letterSpacing: '0.02em',
      fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' },
      animation: 'bounce 0.8s ease-out',
      '@keyframes bounce': {
        '0%': { transform: 'translateY(-10px)', opacity: 0 },
        '50%': { transform: 'translateY(5px)', opacity: 0.8 },
        '100%': { transform: 'translateY(0)', opacity: 1 }
      }
    }}
  >
    {children}
  </Typography>
);

// Usage examples:
export const GameResultDisplay = ({ message }) => {
  // Choose one of these options:
  
  return <GradientTypography>{message}</GradientTypography>;
  // return <OutlinedGlowTypography>{message}</OutlinedGlowTypography>;
  // return <EnhancedSolidTypography>{message}</EnhancedSolidTypography>;
  // return <BackgroundTypography>{message}</BackgroundTypography>;
  // return <AnimatedTypography>{message}</AnimatedTypography>;
};