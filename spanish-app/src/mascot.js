

export default function Mascot({color, smiling, speaking}) {

    let lipModifier = 'smiling';
    if (smiling) {
        lipModifier = 'smiling';
    } else if (speaking) {
        lipModifier = 'speaking';
    }

    return (
        <div className="mascot-container">
            <div className='mascot-ear-container'>
                <div className='mascot-ear left'></div>
                <div className='mascot-ear right'></div>
            </div>
            <div className="mascot-body" sx={{backgroundColor: {color}}}>

                <div className='mascot-eyes'>
                    <div className="mascot-eye left"></div>
                    <div className="mascot-eye right"></div>
                </div>

                <div className="mascot-nose">
                </div>

                <div className="mascot-mouth-container">
                    {/* <div className="mascot-mouth"></div> */}
                    <div className={`mascot-mouth ${lipModifier}`}></div>
                </div>
            </div>
        </div>
    )
    
}