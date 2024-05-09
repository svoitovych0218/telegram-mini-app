import { useCallback, useEffect } from "react"
import { IPlayer, useTelegram } from "../App";
import { useNavigate } from "react-router-dom";

export const GamesList = ({ players, setSelected, selected }: { players: IPlayer[], selected: IPlayer | undefined, setSelected: (player: IPlayer) => void }) => {
    const { webApp } = useTelegram();
    const navigate = useNavigate();
    useEffect(() => {
        if (!selected) {
            webApp?.MainButton.disable();
        } else {
            webApp?.MainButton.enable();
            webApp?.MainButton.setText(`Bet on ${selected.player1}`);
        }
    }, [selected, webApp]);

    const mainButtonClickedHandler = useCallback(() => {
        navigate('/bet');
    }, [navigate]);

    useEffect(() => {
        webApp?.onEvent('mainButtonClicked', mainButtonClickedHandler);
        return () => webApp?.offEvent('mainButtonClicked', mainButtonClickedHandler);
    }, [mainButtonClickedHandler, webApp])
    return (<>
        <form>
            {players.map(s => (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <input type='radio' onClick={() => setSelected(s)} />{s.player1}
                    </div>
                    <div>
                        Wins: {s.wins}
                    </div>
                </div>
            ))}
        </form>
    </>
    )
}