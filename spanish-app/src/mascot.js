import { minHeight } from "@mui/system";


export default function Mascot({color, smiling, speaking, noseSize = 'medium', small = true}) {

    let lipModifier = 'smiling';
    if (smiling) {
        lipModifier = 'smiling';
    } else if (speaking) {
        lipModifier = 'speaking';
    }

    let containerStyle = {};
    if (small) {
        containerStyle = {
            height: '80px',
            width: '60px',
            minHeight: '80px',
            minWidth: '60px'
        };
    }

    console.log(containerStyle);
    return (
        <div className="mascot-container" sx={{containerStyle}}>
            <div className='mascot-ear-container'>
                <div className='mascot-ear left'></div>
                <div className='mascot-ear right'></div>
            </div>
            <div className="mascot-body" sx={{backgroundColor: {color}}}>

                <div className='mascot-eyes'>
                    <div className="mascot-eye left"></div>
                    <div className="mascot-eye right"></div>
                </div>

                <div className={`mascot-nose ${noseSize}`}>
                    <div className="mascot-nose-bridge"></div>
                    <div className="mascot-nose-tip"></div>
                    <div className="mascot-nostrils">
                        <div className="mascot-nostril left"></div>
                        <div className="mascot-nostril right"></div>
                    </div>
                </div>

                <div className="mascot-mouth-container">
                    {/* <div className="mascot-mouth"></div> */}
                    <div className={`mascot-mouth ${lipModifier}`}></div>
                </div>
            </div>
        </div>
    )
    
}