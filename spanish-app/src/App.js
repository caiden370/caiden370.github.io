
import './App.css';
import { use, useEffect, useState } from 'react';
import BottomNavbar from './bottom-navbar';
import ChaptersPage from './chapters-page';
import ProfilePage from './profile-page';
import TopHeader from './top-header';
import GameMenu from './game-menu';
import GameWrapper from './game-wrapper';


function App() {

  const chapters = "Chapters";
  const store = "Store";
  const profile = "Profile";
  const gamePage = "MenuGame"
  const game = "game"

  const [navSelection, setNavSelection] = useState(chapters);
  const [pageContent, setPageContent] = useState(<ChaptersPage/>);
  const [coins, setCoins] = useState(100);
  const [globalName, setGlobalName] = useState('Caiden Kiani');
  const [experience, setExperience] = useState(120);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [gameId, setGameId] = useState('1');

  function changePage() {
    switch (navSelection) {
      case chapters:
        setPageContent(<ChaptersPage setChapterIndex={setChapterIndex} setSection={setNavSelection}/>);
        break;
      case store:
        setPageContent(<div/>);
        break;    
      case profile:
        setPageContent(<ProfilePage globalName={globalName} setGlobalName={setGlobalName} experience={experience}/>);
        break;   
      case gamePage:
        setPageContent(<GameMenu chapterIndex={chapterIndex} setGameId={setGameId} setSection={setNavSelection}></GameMenu>); 
        break;    
      case game:
        setPageContent(<GameWrapper gameId={gameId} chapterIndex={chapterIndex} setSection={setNavSelection}></GameWrapper>);
        break;
    }    
  }
  
  useEffect(() => {
    changePage();
    
  }, [navSelection]);

  return (
    <div className="App">
      <div className='top-header-outer-container'>
      <TopHeader coins={coins}></TopHeader>
      </div>
      
      <div className='page-container'>
        {pageContent}
      </div>
      <div className='navbar-container'>
      <BottomNavbar setSelection={setNavSelection}/>
      </div>
      
    </div>
  );
}

export default App;
