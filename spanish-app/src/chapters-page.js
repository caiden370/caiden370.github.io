import ChapterCard from "./card";
import chapterCovers from "./json-files/chapterCovers.json"
import './App.css';

export default function ChaptersPage({setSection, setChapterIndex}) {


    


    return (
        <div className="chapters-container">
            {chapterCovers.map((chapter, i) => (
                <ChapterCard key={i*100} number={chapter.number} content={chapter.description} title={chapter.title} color={chapter.color} setSection={setSection} setIndex={setChapterIndex} i={i}/>
            ))}
            <div className='chapters-padding'/>
        </div>
        
    );
}