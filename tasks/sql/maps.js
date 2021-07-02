SELECT
    map.name,
    count(*) as games,

    SUM(CASE WHEN redcaps > bluecaps THEN 1 END) as win_red,
    SUM(CASE WHEN redcaps < bluecaps THEN 1 END) as win_blue,

    ROUND(
        (
        SUM(CASE WHEN redcaps > bluecaps THEN 1 END) / count(*)::DECIMAL
        ) * 100
    , 2) as red_win_percentage,

    ROUND(
        (
        SUM(CASE WHEN redcaps < bluecaps THEN 1 END) / count(*)::DECIMAL
        ) * 100
    , 2) as blue_win_percentage,

    sum(redcaps) + sum(bluecaps) as cap_total,

    ROUND(avg(redcaps), 2) as cap_average_red,
    ROUND(avg(bluecaps), 2) as cap_average_blue,

    ROUND( ( sum(redcaps) + sum(bluecaps) ) / count(*)::decimal, 2) as cap_average

FROM game
LEFT JOIN map ON map.id = game.mapid
WHERE seasonid = 1
GROUP BY map.name
ORDER BY cap_average DESC
