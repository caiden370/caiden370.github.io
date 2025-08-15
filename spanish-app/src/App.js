
import './App.css';
import { use, useEffect, useState } from 'react';
import BottomNavbar from './bottom-navbar';
import ChaptersPage from './chapters-page';
import ProfilePage from './profile-page';
import TopHeader from './top-header';
import GameMenu from './game-menu';
import GameWrapper from './game-wrapper';
import { computeLevel } from './profile-page';
import SettingsPage from './settings-page';
import AnimatedScoreIncrease from './animations/coin-animation';
import { initMascotStorage } from './utils/mascotStorage';


function App() {
  const chapters = "Chapters";
  const store = "Store";
  const profile = "Profile";
  const gamePage = "MenuGame";
  const game = "game";
  const settings = 'Settings';

  const [navSelection, setNavSelection] = useState(chapters);
  const [pageContent, setPageContent] = useState(<ChaptersPage/>);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [gameId, setGameId] = useState('1');
  initMascotStorage();

  // STATS TRACKING
  function safeGetItem(key) {
    return Number(localStorage.getItem(key)) | 0;
  }

  function getNameFromStorage() {
    return localStorage.getItem('player-name') || 'Newbie';
  }

  function setNameInStorage(name) {
    localStorage.setItem('player-name', name);
  }



  const [coins, setCoins] = useState(safeGetItem('coins'));
  const [experience, setExperience] = useState(safeGetItem('experience'));

  function changePage() {
    switch (navSelection) {
      case chapters:
        setPageContent(<ChaptersPage setChapterIndex={setChapterIndex} setSection={setNavSelection}/>);
        break;
      case store:
        setPageContent(<div/>);
        break;    
      case profile:
        setPageContent(<ProfilePage globalName={getNameFromStorage()} setGlobalName={setNameInStorage} setSelection={setNavSelection} experience={experience}/>);
        break;   
      case settings:
        setPageContent(<SettingsPage></SettingsPage>);
        break;
      case gamePage:
        setPageContent(<GameMenu chapterIndex={chapterIndex} setGameId={setGameId} setSection={setNavSelection}></GameMenu>); 
        break;    
      case game:
        setPageContent(<GameWrapper gameId={gameId} chapterIndex={chapterIndex} setSection={setNavSelection} updatePoints={updatePoints}></GameWrapper>);
        break;
      
    }    
  }
  
  useEffect(() => {
    changePage();
    
  }, [navSelection]);

  useEffect(() => {
    localStorage.setItem('coins', String(coins));
    localStorage.setItem('experience', String(experience));

  }, [coins, experience])


  function updatePoints(coinsInc, expInc) {
    const coins = Number(localStorage.getItem('coins')) || 0;
    const exp = Number(localStorage.getItem('experience')) || 0;
  
    setCoins(coins + (Number(coinsInc) || 0));
    setExperience(exp + (Number(expInc) || 0));
  }
  






  return (
    <div className="App">
      <div className='top-header-outer-container'>
      <TopHeader coins={coins} level={computeLevel(experience)}></TopHeader>
      </div>
      
      <div className='page-container'>
        {pageContent}
      </div>
      {navSelection != game && (<div className='navbar-container'>
      <BottomNavbar setSelection={setNavSelection}/>
      </div>)}
      
    </div>
  );
}

export default App;
