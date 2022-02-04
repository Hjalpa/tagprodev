<?

error_reporting(E_ERROR | E_PARSE);

require_once 'eu.reader.php';
require_once 'eu.parser.php';
require_once "eu.php";

$eu = new eu;

if($argv[1]) {
	echo json_encode($eu->game($argv[1]), JSON_NUMERIC_CHECK);

	 // $data = $eu->game($argv[1]);
	 // foreach($data['players'] as $k => $v) {
	 // 	echo $v['team'] . ' cap: ' . $v['cap_whilst_having_active_pup'] . ' ... ' . $v['name'] . "\n";
	 // 	echo $v['team'] . ' team for: ' . $v['cap_whilst_having_active_pup_team_for'] . ' ... ' . $v['name'] . "\n";
	 // 	echo $v['team'] . ' team against: ' . $v['cap_whilst_having_active_pup_team_against'] . ' ... ' . $v['name'] . "\n";
		// echo "\n";
	 // }
}
