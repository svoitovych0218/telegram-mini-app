const games = [{
    player1: 'Player1',
    wins: 2
},
{
    player1: 'Player2',
    wins: 3
},
{
    player1: 'Player3',
    wins: 7
},
{
    player1: 'Player4',
    wins: 1
},
{
    player1: 'Player5',
    wins: 5
}]

export const GamesList = () => {
    return (<>
        {games.map(s => (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <input type='checkbox' />{s.player1}
                </div>
                <div>
                    Wins: {s.wins}
                </div>
            </div>
        ))}
    </>
    )
}