SELECT
    player.name as player,

    avg(cap) as cap,
    ROUND(
        (SELECT count(*) FROM playergame as _pg WHERE _pg.playerid = playergame.playerid) / count(*)::DECIMAL
    , 2) as top_every_x_games

FROM playergame
LEFT JOIN player ON player.id = playergame.playerid
LEFT JOIN game ON game.id = playergame.gameid
WHERE
      -- change playergame.cap and MAX(cap)
    playergame.prevent = (SELECT MAX(prevent) FROM playergame WHERE gameid = game.id AND playerid = playergame.playerid)
    -- AND playergame.result_half_win = 1
     AND elo >= 2000

GROUP BY player.name, playergame.playerid
HAVING COUNT(*) > 10
ORDER BY top_every_x_games ASC
LIMIT 30
