import { Link } from "react-router-dom"
import { useTelegram } from "../App";

export const Header = () => {
    const { webApp } = useTelegram();
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div> <Link style={{ color: webApp?.themeParams.text_color }} to={'/bet'} >Bet</Link> </div>
            <div> <Link style={{ color: webApp?.themeParams.text_color }} to={'/'} >Players</Link> </div>
        </div>
    )
}