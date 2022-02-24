const mvb = {

	getSelect: (gamemode) => {

		switch(gamemode) {
			case 'ctf':
				return `
					Round(
						(sum(cap) * 110)
						+
						(count(*) filter (where cap >= 3) * 100)
						+
						(sum(assist) * 60)
						+
						(count(*) filter (where assist >= 3) * 100)
						+
						(sum(pup_rb + pup_jj + pup_tp) * 30)
						+
						(sum(key_return) * 30)
						+
						(sum(good_kiss) * 30)
						+
						(sum(return_within_2_tiles_from_opponents_base) * 30) -- saves
						+
						(sum(return_within_5_tiles_from_opponents_base) * 15) -- clearances
						+
						(SUM(reset_from_my_prevent + reset_from_my_return) * 25)
						+
						(SUM(handoff_drop + handoff_pickup) * 25)
						+
						(sum(return) * 4)
						+
						sum(tag)
						+
						sum(long_hold) * 20
						+
						(sum(prevent) * 0.5)
						+
						(sum(hold) * 0.5)
						+
						(sum(long_hold_and_cap) * 30)
						+
						(sum(cap_from_grab_whilst_opponents_prevent) * 30)
						+
						(
							(sum(result_half_win) * 100)
							+
							(count(*) filter (where result_half_win = result_half_lose) * 33)
							+
							(sum(position_win_time) * .5)
							+
							(sum(cap_team_for - cap_team_against) * 50)
						)
					, 0)
				`
				break;
			case 'nf':
				return `
					Round(
						Round(sum(cap) * 100, 0)
						+
						Round(
								count(*) filter (where cap >= 3)
								* 100
						, 0)
						+
							Round(sum(cap_from_tapin) * 25, 0)
						+

							Round(sum(cap_whilst_having_active_pup) * 25, 0)
						+
							Round((sum(pup_rb) + sum(pup_jj) * 25), 0)
						+
							Round(sum(assist) * 50, 0)
						+
							(
								(count(*) filter (where assist >= 3) * 100)
							)
						+
							Round(sum(tapin_from_my_chain) * 50, 0)
						+
							Round(sum(takeover_good) * 5, 0)
						+
							Round(sum(tag) * 2, 0)
						+
							Round(sum(hold) / 2, 0)
						+
							Round(sum(flag_carry_distance) / 10, 0)
						+
							(sum(prevent) / 4)
						+
							Round(sum(long_hold) * 50, 0)
						+
							Round((sum(hold_before_cap)::DECIMAL / sum(cap)::DECIMAL) * 150, 0)
						+
							Round(sum(chain) * 15, 0)
				, 0)
				`
				break;
		}
	},

	getSelectSingle: (gamemode) => {

		switch(gamemode) {
			case 'ctf':
				return `
					Round(
						(cap * 110)
						+
						-- (count(*) filter (where cap >= 3) * 100)
						CASE WHEN cap >= 3 THEN 100 ELSE 0 END
						+
						(assist * 60)
						+
						--(count(*) filter (where assist >= 3) * 100)
						CASE WHEN assist >= 3 THEN 100 ELSE 0 END
						+
						((pup_rb + pup_jj + pup_tp) * 30)
						+
						(key_return * 30)
						+
						(good_kiss * 30)
						+
						((return_within_2_tiles_from_opponents_base) * 30) -- saves
						+
						((return_within_5_tiles_from_opponents_base) * 15) -- clearances
						+
						((reset_from_my_prevent + reset_from_my_return) * 25)
						+
						((handoff_drop + handoff_pickup) * 25)
						+
						(return * 4)
						+
						tag
						+
						(long_hold * 20)
						+
						(prevent * 0.5)
						+
						(hold * 0.5)
						+
						(long_hold_and_cap * 30)
						+
						(cap_from_grab_whilst_opponents_prevent * 30)
						+
						(result_half_win * 100)
						+
						CASE WHEN result_half_win = result_half_lose THEN 33 ELSE 0 END
					, 0)
				`
				break;
			case 'nf':
				return `
					Round(
						Round(sum(cap) * 100, 0)
						+
						Round(
								count(*) filter (where cap >= 3)
								* 100
						, 0)
						+
							Round(sum(cap_from_tapin) * 25, 0)
						+

							Round(sum(cap_whilst_having_active_pup) * 25, 0)
						+
							Round((sum(pup_rb) + sum(pup_jj) * 25), 0)
						+
							Round(sum(assist) * 50, 0)
						+
							(
								(count(*) filter (where assist >= 3) * 100)
							)
						+
							Round(sum(tapin_from_my_chain) * 50, 0)
						+
							Round(sum(takeover_good) * 5, 0)
						+
							Round(sum(tag) * 2, 0)
						+
							Round(sum(hold) / 2, 0)
						+
							Round(sum(flag_carry_distance) / 10, 0)
						+
							(sum(prevent) / 4)
						+
							Round(sum(long_hold) * 50, 0)
						+
							Round((sum(hold_before_cap)::DECIMAL / sum(cap)::DECIMAL) * 150, 0)
						+
							Round(sum(chain) * 15, 0)
				, 0)
				`
				break;
		}
	}

}

module.exports = mvb
