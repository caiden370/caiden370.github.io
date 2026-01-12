import { Typography } from "@mui/material";
import { VoiceSettingsButton } from "./voice-selection";
import { useState } from "react";
import { Gear} from 'phosphor-react';

export default function SettingsPage({}) {

    const [content, setContent] = useState(<MainContent></MainContent>)

    function MainContent({}) {
        return (
            <div className="settings-page-container">
                <div className="settings-header-container">
                <Typography align="center" sx={{fontSize: 25}}> Settings</Typography>
                </div>
                
                    <VoiceSettingsButton></VoiceSettingsButton>
            </div>
        )
    }



    return (
        <>
        {content}
        </>
    );
}

export function SettingsButton({handleClick, iconContent, label, description}) {
    return (
        <div className="settings-button-container" onClick={handleClick}>
            {iconContent}    
            <div className='settings-label'>
                <Typography align="left" level='h3'>{label}</Typography>
                {/* <Typography align="left" level='title'>{description}</Typography> */}
            </div>
        </div>
    )
}


export function GlobalSettingsButton({setSection}) {
    return (
        <div className="global-settings-button" onClick={() => setSection('Settings')}>
        {<Gear size={36} color={"rgb(117, 100, 100)"} weight={"duotone"} className={"drop-shadow-sm"} ></Gear>}
        </div>
    )
}