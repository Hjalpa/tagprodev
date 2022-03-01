const mvb = {

	getSelect: (gamemode) => {

		switch(gamemode) {
			case 'ctf':
				return `
					Round(
						(sum(cap) * 100)
						+
						(count(*) filter (where cap >= 3) * 200) -- hatrick
						+
						(sum(assist) * 40)
						+
						(count(*) filter (where assist >= 3) * 80) -- playmaker
						+
						(sum(pup_rb + pup_jj + pup_tp) * 50)
						+
						(sum(key_return) * 25)
						+
						(sum(good_kiss) * 20)
						+
						(sum(kiss) * 5)
						+
						(sum(return_within_2_tiles_from_opponents_base) * 50) -- saves
						+
						(sum(return_within_5_tiles_from_opponents_base) * 20) -- clearances
						+
						(SUM(reset_from_my_prevent) * 20)
						+
						(sum(reset_from_my_return) * 40)
						+
						(SUM(handoff_drop + handoff_pickup) * 25)
						+
						(sum(return) * 6)
						+
						(sum(tag) * 3)
						+
						(sum(grab) * 3)
						+
						sum(long_hold) * 20
						+
						(sum(prevent) * 0.5)
						+
						(sum(hold) * 0.7)
						+
						(sum(long_hold_and_cap) * 50)
						+
						(sum(result_half_win) * 200)
						+
						(sum(position_win_time) * 2)
						+
						(count(*) filter (where result_half_win = result_half_lose) * 100)
						+
						(sum(cap_from_grab_whilst_opponents_prevent) * 50)
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
						(cap * 100)
						+
						CASE WHEN cap >= 3 THEN 200 ELSE 0 END
						+
						(assist * 40)
						+
						CASE WHEN assist >= 3 THEN 80 ELSE 0 END
						+
						((pup_rb + pup_jj + pup_tp) * 50)
						+
						(key_return * 25)
						+
						(good_kiss * 25)
						+
						((return_within_2_tiles_from_opponents_base) * 50) -- saves
						+
						((return_within_5_tiles_from_opponents_base) * 20) -- clearances
						+
						(reset_from_my_prevent * 20)
						+
						(reset_from_my_return * 40)
						+
						((handoff_drop + handoff_pickup) * 25)
						+
						(return * 6)
						+
						(tag * 3)
						+
						(long_hold * 20)
						+
						(prevent * 0.5)
						+
						(hold * 0.7)
						+
						(long_hold_and_cap * 100)
						+
						(cap_from_grab_whilst_opponents_prevent * 100)
						+
						(result_half_win * 200)
						+
						CASE WHEN result_half_win = result_half_lose THEN 50 ELSE 0 END
						+
						(position_win_time * 2)
					, 0)
				`
				break;
			case 'nf':
				return `
					Round(
							(cap * 100)
						+
							CASE WHEN cap >= 3 THEN 100 ELSE 0 END
						+
							(cap_from_tapin * 25)
						+
							(cap_whilst_having_active_pup * 25)
						+
							(pup_rb + pup_jj * 25)
						+
							(assist * 50)
						+
							CASE WHEN assist >= 3 THEN 100 ELSE 0 END
						+
							(tapin_from_my_chain * 50)
						+
							(takeover_good * 5)
						+
							(tag * 2)
						+
							(hold / 2)
						+
							(flag_carry_distance / 10)
						+
							(prevent / 4)
						+
							(long_hold * 50)
						+
							CASE WHEN cap > 0 THEN ((hold_before_cap / cap) * 150) ELSE 0 END
						+
							(chain * 15)
					, 0)
				`
				break;
		}
	}

}

module.exports = mvb
