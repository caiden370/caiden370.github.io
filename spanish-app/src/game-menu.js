
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/joy/Button';
import './App.css';


export default function GameMenu({setGameId, setSection}) {

    const game = 'game'
    const handleClick = (e) => {
        setGameId(e.target.value);
        setSection(game);
    }



    function Item({color, itemGameId, text}) {
        return (
            <Button className='game-menu-item' value={itemGameId} variant='outlined' onClick={handleClick} sx={{backgroundColor: {color}}}>{text}</Button>
        );
    }


    return (
        <div className="game-menu-container">
            <Box sx={{ flexGrow: 1, width: '80%', justifyContent: 'center', display: 'flex',  height: '40%', color: 'primary'  }}>
            <Grid sx={{width: '80%'}}container spacing={0}>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'1'} text={"Mixed Review"}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'2'} text={"Audio Review"}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'3'} text={'Conversation Practice'}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'4'}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'5'}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'6'}></Item>
                </Grid>
            </Grid>
            </Box>
        </div>



    );
}