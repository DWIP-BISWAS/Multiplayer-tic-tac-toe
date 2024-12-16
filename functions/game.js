let games = {};

exports.handler = async (event) => {
  const { action, gameId, username, index } = JSON.parse(event.body || "{}");

  if (action === "start") {
    const newGameId = Math.random().toString(36).substr(2, 9);
    games[newGameId] = { players: [username], board: Array(9).fill(""), currentTurn: "X" };
    return { statusCode: 200, body: JSON.stringify({ gameId: newGameId, currentPlayer: "X" }) };
  }

  if (action === "move" && games[gameId]) {
    const game = games[gameId];
    if (game.board[index]) return { statusCode: 400, body: JSON.stringify({ error: "Cell already taken." }) };
    game.board[index] = game.currentTurn;
    game.currentTurn = game.currentTurn === "X" ? "O" : "X";
    return { statusCode: 200, body: JSON.stringify({ boardState: game.board }) };
  }

  return { statusCode: 400, body: JSON.stringify({ error: "Invalid action." }) };
};
      
