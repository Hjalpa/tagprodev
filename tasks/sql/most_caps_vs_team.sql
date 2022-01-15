select
    t.name,
    array(
        select
            jsonb_build_object(
                'player', player.name,
                'caps', sum(cap)
            ) as data

        from playergame
        left join game on playergame.gameid = game.id
        left join seasonschedule on playergame.gameid = seasonschedule.gameid
        left join team on
            (seasonschedule.teamredid = team.id AND playergame.team = 2) OR (seasonschedule.teamblueid = team.id AND playergame.team = 1)
        left join player on playergame.playerid = player.id

        where team.id = t.id
        group by team.name, player.name
        order by team.name ASC, sum(cap) DESC
        LIMIT 10
    ) as caps
from team as t
left join seasonteam on t.id = seasonteam.teamid
where seasonid = 5
