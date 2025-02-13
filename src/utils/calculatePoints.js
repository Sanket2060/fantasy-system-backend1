export const calculatePoints = (matchDetails, players) => {
  const playerPoints = [];
  // Initialize points for all players who played in the match
  const allPlayers = [
    ...matchDetails.playersPlayedTeam1,
    ...matchDetails.playersPlayedTeam2,
  ];

  allPlayers.forEach((playerId) => {
    playerPoints.push({
      playerId,
      matchNumber: matchDetails.matchNumber,
      points: 1,
    }); // 1 point for playing the match
  });
  console.log("playerPoints", playerPoints);

  // Helper function to add points:takes specified points and adds to the player by finding that player
  const addPoints = (playerId, points) => {
    const playerPoint = playerPoints.find(
      (pp) => pp.playerId.toString() === playerId.toString()
    );
    // console.log("playerPoint", playerPoint);
    if (playerPoint) {
      playerPoint.points += points;
      console.log(
        "After points increase:",
        playerPoint.playerId,
        playerPoint.points
      );
    }
  };

  // Points for goals scored
  matchDetails.goalsScoredBy.forEach((goal) => {
    const player = players.find(
      (p) => p._id.toString() === goal.player.toString()
    );
    if (player) {
      console.log("matched");
      let points = 0;
      switch (player.playerType) {
        case "goalkeeper":
          points = 10;
          break;
        case "defender":
          points = 6;
          break;
        case "midfielder":
          points = 5;
          break;
        case "forward":
          points = 4;
          break;
      }
      console.log("player and his points for scoring:", player.name, points);
      addPoints(goal.player, points);
      // Points for assists:⚠️check the logic once
      // goal.assists.forEach((assist) => addPoints(assist, 3));
    }
  });

  // Points for clean sheets:⚠️needs update for the match score
  // const cleanSheetPlayers = [
  //   ...matchDetails.playersPlayedTeam1,
  //   ...matchDetails.playersPlayedTeam2,
  // ];
  // cleanSheetPlayers.forEach((playerId) => {
  //   const player = players.find((p) => p._id.toString() === playerId);
  //   if (player && matchDetails.score === "0-0") {
  //     switch (player.playerType) {
  //       case "goalkeeper":
  //       case "defender":
  //         addPoints(playerId, 4);
  //         break;
  //       case "midfielder":
  //         addPoints(playerId, 1);
  //         break;
  //     }
  //   }
  // });

  // Points for penalty saves
  matchDetails.penaltySaves.forEach((playerId) => addPoints(playerId, 5));

  // Points for penalties missed
  matchDetails.penaltiesMissed.forEach((playerId) => addPoints(playerId, -2));

  // Points for yellow cards
  matchDetails.cardsObtained.yellow.forEach((playerId) =>
    addPoints(playerId, -1)
  );

  // Points for red cards
  matchDetails.cardsObtained.red.forEach((playerId) => addPoints(playerId, -3));

  //   Points for own goals
  matchDetails.ownGoals.forEach((playerId) => addPoints(playerId, -2));
  console.log("playerPoints at the end", playerPoints);

  return playerPoints;
};
