import { useEffect, useState } from "react"
import { IPlayer, useTelegram } from "../App"

export const Bet = ({player}: {player: IPlayer}) => {
    const [amount, setAmount] = useState<number>(0);
    const {webApp} = useTelegram();
    useEffect(()=>{
        if (!amount){
            webApp?.MainButton.disable();
        } else {
            webApp?.MainButton.enable();
            webApp?.MainButton.setText(`Bet ${amount} on player ${player.player1}`);
        }
    }, [amount, player.player1, webApp?.MainButton])

    return (
        <>
            <form>
                <div>Bet on player: {player.player1}</div>
                <input type="number" title="Amount" value={amount} onChange={(e)=>setAmount(+e.target.value)}/> 
            </form>
        </>
    )
}