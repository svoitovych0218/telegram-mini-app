import { useCallback, useEffect, useState } from "react"
import { IPlayer, useTelegram } from "../App"

export const Bet = ({ player }: { player: IPlayer }) => {
    const [amount, setAmount] = useState<number>(0);
    const { webApp } = useTelegram();

    const mainButtonClickedHandler = useCallback(() => {
        console.log('send data');
        webApp?.sendData(`/bet ${player.id} ${amount}`);
    }, [webApp, amount, player.id])

    useEffect(() => {
        if (!amount) {
            webApp?.MainButton.disable();
        } else {
            webApp?.MainButton.enable();
            webApp?.MainButton.setText(`Bet ${amount} on player ${player.player1}`);
        }

        webApp?.onEvent('mainButtonClicked', mainButtonClickedHandler);

        return webApp?.offEvent('mainButtonClicked', mainButtonClickedHandler);
    }, [amount, player.player1, webApp?.MainButton, mainButtonClickedHandler, webApp])
    return (
        <>
            <form>
                <div>Bet on player: {player.player1}</div>
                <input type="number" title="Amount" value={amount} onChange={(e) => setAmount(+e.target.value)} />
            </form>
        </>
    )
}