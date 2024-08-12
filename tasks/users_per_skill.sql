WITH player_openskill AS (
    SELECT
        ROUND(tp_playergame.openskill) AS rounded_openskill,
        COUNT(DISTINCT tp_player.id) AS players_count
    FROM
        tp_player
    LEFT JOIN
        (SELECT
            playerid,
            openskill,
            ROW_NUMBER() OVER (PARTITION BY playerid ORDER BY datetime DESC) AS row_num
         FROM
            tp_playergame) AS tp_playergame ON tp_player.id = tp_playergame.playerid
    WHERE
        tp_player.multiuser IS false
        AND tp_player.tpid IS NOT NULL
        AND tp_playergame.row_num = 1
        AND openskill > 0
    GROUP BY
        ROUND(tp_playergame.openskill)
)

SELECT
    rounded_openskill,
    SUM(players_count) OVER (ORDER BY rounded_openskill) AS cumulative_players,
    ROUND((SUM(players_count) OVER (ORDER BY rounded_openskill))::numeric / (SELECT COUNT(DISTINCT id) FROM tp_player) * 100, 2) AS cumulative_percentage,
    players_count
FROM
    player_openskill
