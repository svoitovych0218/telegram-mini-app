import { useEffect, useState } from "react"
import { useTelegram } from "../App";

const games = [{
    id: 1,
    player1: 'Player1',
    wins: 2
},
{
    id: 2,
    player1: 'Player2',
    wins: 3
},
{
    id: 3,
    player1: 'Player3',
    wins: 7
},
{
    id: 4,
    player1: 'Player4',
    wins: 1
},
{
    id: 5,
    player1: 'Player5',
    wins: 5
}]

export const GamesList = () => {
    const [selected, setSelected] = useState<any | undefined>(undefined);
    const {webApp} = useTelegram();
    useEffect(()=>{
        if (!selected) {
            webApp?.MainButton.disable();
        } else {
            webApp?.MainButton.enable();
            webApp?.MainButton.setText(`Bet on ${selected.player1}`);
        }
    }, [selected, webApp]);
    return (<>
        {games.map(s => (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <input type='radio' onClick={()=>setSelected(s)} />{s.player1}
                </div>
                <div>
                    Wins: {s.wins}
                </div>
            </div>
        ))}
    </>
    )
}