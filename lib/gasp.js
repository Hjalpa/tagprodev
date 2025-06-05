const gasp = {

	fixGASP: (data) => {
		for(let pid in data) {
			delete data[pid].raw_gasp

			data[pid].dgasp = data[pid].real_dgasp
			delete data[pid].real_dgasp

			data[pid].ogasp = data[pid].real_ogasp
			delete data[pid].real_ogasp
		}
		return data
	},

	fixNFGASP: (data) => {
		for(let pid in data) {
			data[pid].gasp = data[pid].true_gasp
			delete data[pid].true_gasp
		}
		return data
	},

	getSelect: (gamemode, pos) => {
		switch(gamemode) {
			case 'ctf':
			case 'eltp':
			case 'mltp':
			case 'nltp':
				switch(pos) {
					case 'd':
						return `
							Round(
								(sum(prevent)::decimal / max(sum(prevent)::decimal) over () * 3.25)::decimal +
								CASE
									WHEN max(sum(key_return)::decimal) over () <> 0
									THEN (sum(key_return)::decimal / max(sum(key_return)::decimal) over () * 1.25)::decimal
									ELSE 0
								END +
								(sum(reset_from_my_prevent)::decimal / max(sum(reset_from_my_prevent)::decimal) over () * 1.25)::decimal +
								(sum(reset_from_my_return)::decimal / max(sum(reset_from_my_return)::decimal) over () * 1.25)::decimal +
								(sum(return)::decimal / max(sum(return)::decimal) over () * 1.5)::decimal +
								(sum(tag-pop)::decimal / max(sum(tag-pop)::decimal) over () * 1)::decimal +
								(
									(
										CASE WHEN sum(opponents_grab_whilst_my_prevent) = 0
										THEN 0
										ELSE sum(prevent)::decimal / nullif(sum(opponents_grab_whilst_my_prevent),0)
										END
									)
									/
									max(coalesce(sum(prevent)::decimal / nullif(sum(opponents_grab_whilst_my_prevent),0), 0)) over () * 1.25
								)::decimal +
								(sum(quick_return)::decimal / max(sum(quick_return)::decimal) over () * .75)::decimal +
								(sum(tag-return)::decimal / max(sum(tag-return)::decimal) over () * .5)::decimal +
								(sum(prevent_whilst_team_hold_time)::decimal / max(sum(prevent_whilst_team_hold_time)::decimal) over () * 1)::decimal +
								(
									(
										(
											CASE WHEN sum(tag_team_for) = 0 OR sum(prevent_team_for) = 0
											THEN 0
											ELSE ROUND((sum(return)::DECIMAL / sum(tag_team_for)::DECIMAL) * 100, 0)
													+
													ROUND((sum(prevent)::DECIMAL / sum(prevent_team_for)::DECIMAL) * 100, 0)
											END
										)
										/
										max(
											CASE WHEN sum(tag_team_for) = 0 OR sum(prevent_team_for) = 0
											THEN 0
											ELSE ROUND((sum(return)::DECIMAL / sum(tag_team_for)::DECIMAL) * 100, 0)
													+
													ROUND((sum(prevent)::DECIMAL / sum(prevent_team_for)::DECIMAL) * 100, 0)
											END
										) over()
									)
									* .5
								)::decimal +
								(sum((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal / max(sum((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal) over () * 1.5)::decimal
							, 2)
						`
						break;
					case 'o':
						return `
							Round(
								(sum(hold)::decimal / max(sum(hold)::decimal) over () * 2.5)::decimal +
								(sum(cap)::decimal / max(sum(cap)::decimal) over () * 5)::decimal +
								(sum(regrab_pickup)::decimal / max(sum(regrab_pickup)::decimal) over () * .75)::decimal +
								(sum(regrab_drop)::decimal / max(sum(regrab_drop)::decimal) over () * .75)::decimal +
								(sum(grab_whilst_opponents_prevent)::decimal / max(sum(grab_whilst_opponents_prevent)::decimal) over () * .75)::decimal +
								(sum(grab)::decimal / max(sum(grab)::decimal) over () * .75)::decimal +
								(sum(long_hold)::decimal / max(sum(long_hold)::decimal) over () * .5)::decimal +

								CASE
									WHEN max(sum(good_kiss)::decimal) over () <> 0
									THEN (sum(good_kiss)::decimal / max(sum(good_kiss)::decimal) over () * 0.5)::decimal
									ELSE 0  -- or any other default value or handling you prefer
								END +

								(
									(
										CASE WHEN sum(flaccid) = 0
										THEN 0
										ELSE sum(grab)::decimal / nullif(sum(flaccid),0)
										END
									)
									/
									max(coalesce(sum(grab)::decimal / nullif(sum(flaccid),0), 0)) over () * 0.75
								)::decimal +
								(sum(return_within_5_tiles_from_opponents_base)::decimal / max(sum(return_within_5_tiles_from_opponents_base)::decimal) over () * .75)::decimal +
								(
									(
										(
											CASE WHEN sum(grab_team_for) = 0 OR sum(hold_team_for) = 0
											THEN 0
												ELSE ROUND((sum(grab)::DECIMAL / sum(grab_team_for)::DECIMAL) * 100, 0)
												+
												ROUND((sum(hold)::DECIMAL / sum(hold_team_for)::DECIMAL) * 100, 0)
											END
										)
										/
										max(
											CASE WHEN sum(grab_team_for) = 0 OR sum(hold_team_for) = 0
											THEN 0
												ELSE ROUND((sum(grab)::DECIMAL / sum(grab_team_for)::DECIMAL) * 100, 0)
												+
												ROUND((sum(hold)::DECIMAL / sum(hold_team_for)::DECIMAL) * 100, 0)
											END
										) over()
									)
									* .5
								)::decimal +
								(sum((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal / max(sum((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal) over () * 1.5)::decimal
							, 2)
						`
						break;
				}
				break;
			case 'nf':
			case 'ecltp':
				return `
					Round(
						(sum(hold)::decimal / max(sum(hold)::decimal) over () * 3)::decimal +
						(sum(prevent)::decimal / max(sum(prevent)::decimal) over () * 2)::decimal +
						(sum(cap)::decimal / max(sum(cap)::decimal) over () * 8)::decimal +
						(sum(assist)::decimal / max(sum(assist)::decimal) over () * 2)::decimal +
						(sum(tag)::decimal / max(sum(tag)::decimal) over () * 1)::decimal +
						(sum(takeover_good)::decimal / max(sum(takeover_good)::decimal) over () * 2)::decimal +
						(sum(takeover - dispossessed)::decimal / max(sum(takeover - dispossessed)::decimal) over () * 2)::decimal +
						(sum(chain)::decimal / max(sum(chain)::decimal) over () * 1)::decimal +
						(sum(grab)::decimal / max(sum(grab)::decimal) over () * 2)::decimal +
						(
							(
								(
									CASE WHEN sum(grab) = 0
									THEN 0
									ELSE sum(hold)::decimal / nullif(sum(grab),0)
									END
								)
								/
								max(coalesce(sum(hold)::decimal / nullif(sum(grab),0), 0)) over ()
							)::decimal
							* 2
						)::decimal +
						(sum(pup_rb + pup_jj + pup_tp) / max(sum(pup_rb + pup_jj + pup_tp)) over () * 3)::decimal +
						(sum(flag_carry_distance)::decimal / max(sum(flag_carry_distance)::decimal) over () * 2)::decimal
					, 2)
				`
				break;
		}
	},

	getSelectSingle: (gamemode, pos) => {
		switch(gamemode) {
			case 'ctf':
			case 'eltp':
			case 'mltp':
			case 'nltp':
				switch(pos) {
					case 'd':
						return `
							Round(
								(COALESCE(prevent::decimal, 0) / NULLIF(max(prevent::decimal) over (), 0) * 3.5)::decimal +
								(COALESCE(key_return::decimal, 0) / NULLIF(max(key_return::decimal) over (), 0) * 1.5)::decimal +
								COALESCE(reset_from_my_prevent::DECIMAL / NULLIF(MAX(reset_from_my_prevent::DECIMAL) OVER (), 0) * 1.25, 0)::DECIMAL +
								COALESCE(reset_from_my_return::DECIMAL / NULLIF(MAX(reset_from_my_return::DECIMAL) OVER (), 0) * 1.25, 0)::DECIMAL +
								(return::decimal / max(return::decimal) over () * 1.5)::decimal +
								(tag - pop::decimal / max(tag::decimal - pop::decimal) over () * 1)::decimal +
								((prevent::DECIMAL / COALESCE(NULLIF(opponents_grab_whilst_my_prevent::decimal, 0), 1))::decimal /
								max(prevent::DECIMAL / COALESCE(NULLIF(opponents_grab_whilst_my_prevent::decimal, 0), 1)) over () * 1.22)::decimal +
								(quick_return::decimal / max(quick_return::decimal) over () * .75)::decimal +
								(tag - return::decimal / max(tag::decimal - return::decimal) over () * .5)::decimal +
								(prevent_whilst_team_hold_time::decimal / max(prevent_whilst_team_hold_time::decimal) over () * 1)::decimal +
								(
									(
										(
											CASE WHEN tag_team_for = 0 OR prevent_team_for = 0
											THEN 0
											ELSE
												ROUND((return::DECIMAL / tag_team_for::DECIMAL) * 100, 0)
												+
												ROUND((prevent::DECIMAL / prevent_team_for::DECIMAL) * 100, 0)
											END
										)
										/
										max(
											CASE WHEN tag_team_for = 0 OR prevent_team_for = 0
											THEN 0
											ELSE
												ROUND((return::DECIMAL / tag_team_for::DECIMAL) * 100, 0)
												+
												ROUND((prevent::DECIMAL / prevent_team_for::DECIMAL) * 100, 0)
											END
										) over()
									)
									* .5
								)::decimal +
								(((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal / max(((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal) over () * 1.5)::decimal
							, 2)
						`
						break;
					case 'o':
						return `
							Round(
								(hold::decimal / max(hold::decimal) over () * 2.5)::decimal +
								(COALESCE(cap::decimal, 0) / NULLIF(max(cap::decimal) over (), 0) * 8)::decimal +
								(COALESCE(regrab_pickup::decimal, 0) / NULLIF(max(regrab_pickup::decimal) over (), 0) * .75)::decimal +
								(COALESCE(regrab_drop::decimal, 0) / NULLIF(max(regrab_drop::decimal) over (), 0) * .75)::decimal +
								(COALESCE(grab_whilst_opponents_prevent::decimal, 0) / NULLIF(max(grab_whilst_opponents_prevent::decimal) over (), 0) * .75)::decimal +
								(grab::decimal / max(grab::decimal) over () * .75)::decimal +
								(COALESCE(long_hold::decimal, 0) / NULLIF(max(long_hold::decimal) over (), 0) * 0.5)::decimal +
								COALESCE(
									(COALESCE(good_kiss::DECIMAL, 0) / NULLIF(COALESCE(MAX(good_kiss::DECIMAL) OVER (), 0), 0)) * 0.5,
									0
								)::DECIMAL +
								(
									(
										CASE
											WHEN flaccid = 0 THEN 0
											ELSE grab::decimal / flaccid::decimal
										END
									)
									/
									CASE
										WHEN max((CASE WHEN flaccid = 0 THEN 0 ELSE grab::decimal / flaccid::decimal END)) over () = 0 THEN 1
										ELSE max((CASE WHEN flaccid = 0 THEN 0 ELSE grab::decimal / flaccid::decimal END)) over () * 0.75
									END
								)::decimal +
								(return_within_5_tiles_from_opponents_base::decimal / max(return_within_5_tiles_from_opponents_base::decimal) over () * .75)::decimal +
								(
									(
										(
											ROUND((grab::DECIMAL / grab_team_for::DECIMAL) * 100, 0)
											+
											ROUND((hold::DECIMAL / hold_team_for::DECIMAL) * 100, 0)
										)
										/
										max(
											ROUND((grab::DECIMAL / grab_team_for::DECIMAL) * 100, 0)
											+
											ROUND((hold::DECIMAL / hold_team_for::DECIMAL) * 100, 0)
										) over()
									)
									* .5
								)::decimal +
								(((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal / max(((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal) over () * 1.5)::decimal
							, 2)
						`
						break;
				}
				break;
			case 'nf':
			case 'ecltp':
				return `
					Round(
						(COALESCE(hold::decimal, 0) / NULLIF(max(hold::decimal) over (), 0) * 3)::decimal +
						(COALESCE(prevent::decimal, 0) / NULLIF(max(prevent::decimal) over (), 0) * 2)::decimal +
						(COALESCE(cap::decimal, 0) / NULLIF(max(cap::decimal) over (), 0) * 8)::decimal +
						(COALESCE(assist::decimal, 0) / NULLIF(max(assist::decimal) over (), 0) * 2)::decimal +
						(COALESCE(tag::decimal, 0) / NULLIF(max(tag::decimal) over (), 0) * 1)::decimal +
						(COALESCE(takeover_good::decimal, 0) / NULLIF(max(takeover_good::decimal) over (), 0) * 2)::decimal +
						(COALESCE((takeover - dispossessed)::decimal, 0) / NULLIF(max((takeover - dispossessed)::decimal) over (), 0) * 2)::decimal +
						(COALESCE(chain::decimal, 0) / NULLIF(max(chain::decimal) over (), 0) * 1)::decimal +
						(COALESCE(grab::decimal, 0) / NULLIF(max(grab::decimal) over (), 0) * 2)::decimal +
						(COALESCE((hold / NULLIF(grab, 0))::decimal, 0) / NULLIF(COALESCE(max(NULLIF((hold / NULLIF(grab, 0))::decimal, 0)) over (), 0), 0) * 2)::decimal +
						(((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal / max(((pup_rb * .7) + (pup_jj * .7) + (pup_tp * 1.3))::decimal) over () * 3)::decimal +
						(COALESCE(flag_carry_distance::decimal, 0) / NULLIF(max(flag_carry_distance::decimal) over (), 0) * 2)::decimal
					, 2)
				`
				break;
		}
	}

}

module.exports = gasp
