import { Link } from "react-router-dom"

export const Header = () => {
    return (
        <div style={{ display: 'flex' }}>
            <div> <Link to={'/bet'} >Bet</Link> </div>
            <div> <Link to={'/'} >Players</Link> </div>
        </div>
    )
}