
import './App.css';
import { lazy, Suspense, use, useEffect, useState } from 'react';
import BottomNavbar from './bottom-navbar';
import ChaptersPage from './chapters-page';
import ProfilePage from './profile-page';
import TopHeader from './top-header';
import GameMenu from './game-menu';
import GameWrapper from './game-wrapper';
import { computeLevel } from './profile-page';
import SettingsPage, { GlobalSettingsButton } from './settings-page';
import AnimatedScoreIncrease from './animations/coin-animation';
import { initMascotStorage } from './utils/mascotStorage';
import Store from './store';
import TopWordsPage from './top-words-page';
import HomeScreenInstallPrompt from './HomeScreenInstallPrompt';
import OfflineStatus from './offline-status';

const ElCaminoPage = lazy(() => import('./el-camino/ElCaminoPage'));

export const TOP_WORDS_INDEX_RANGE = 10000;
export const CHAPTERS_INDEX_RANGE = 0;
export const MAX_VALUES_PER_RANGE = 10000;

// STATS TRACKING
export function checkNaN(val) {
  return isNaN(val) ? 0 : val; // use global isNaN for broader check
}

export function safeGetItem(key) {
  const raw = localStorage.getItem(key);
  const num = Number(raw);
  return checkNaN(num);
}


export function getNameFromStorage() {
  return localStorage.getItem('player-name') || 'Newbie';
}

export function setNameInStorage(name) {
  localStorage.setItem('player-name', name);
}


function App() {
  const chapters = "Chapters";
  const topWords = "TopWords";
  const elCamino = "ElCamino";
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





  const [coins, setCoins] = useState(safeGetItem('coins'));
  const [experience, setExperience] = useState(safeGetItem('experience'));

  function changePage() {
    switch (navSelection) {
      case chapters:
        setPageContent(<ChaptersPage setChapterIndex={setChapterIndex} setSection={setNavSelection}/>);
        break;
      case topWords:
        setPageContent(<TopWordsPage setChapterIndex={setChapterIndex} setSection={setNavSelection} setGameId={setGameId}/>);
        break;
      case elCamino:
        setPageContent(
          <Suspense fallback={<div></div>}>
            <ElCaminoPage onExit={() => setNavSelection(chapters)} />
          </Suspense>
        );
        break;
      case store:
        setPageContent(<Store setGlobalCoins={setCoins}/>);
        break;    
      case profile:
        setPageContent(<ProfilePage globalName={getNameFromStorage()} setGlobalName={setNameInStorage} setSelection={setNavSelection} experience={experience} setSection={setNavSelection}/>);
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
      {navSelection != elCamino && <TopHeader coins={coins} level={computeLevel(experience)} setSection={setNavSelection}></TopHeader>}
      </div>
      <div className='page-container'>
        {pageContent}
      </div>
      {navSelection != game && navSelection != elCamino && (<div className='navbar-container'>
      <BottomNavbar setSelection={setNavSelection}/>
      </div>)}
      <div className='app-background'></div>
      <HomeScreenInstallPrompt />
      <OfflineStatus />
    </div>
  );
}

export default App;
