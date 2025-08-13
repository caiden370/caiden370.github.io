import { Typography } from "@mui/material";
import { VoiceSettingsButton } from "./voice-selection";
import { useState } from "react";

export default function SettingsPage({}) {

    const [content, setContent] = useState(<MainContent></MainContent>)

    function MainContent({}) {
        return (
            <div className="settings-page-container">
                <Typography align="center" sx={{fontSize: 25}}> Settings</Typography>
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